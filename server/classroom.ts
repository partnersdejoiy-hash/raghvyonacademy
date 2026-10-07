import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { db } from './db';
import { requireRole, getSessionUser } from './lib/auth';
import { encryptToken, decryptToken, randomToken } from './lib/crypto';
export const classroom = Router();
declare module 'express-session' { interface SessionData { classroomState?: string; } }
db.exec(`CREATE TABLE IF NOT EXISTS classroom_accounts(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,access_token TEXT NOT NULL,refresh_token TEXT NOT NULL,expires_at INTEGER NOT NULL,email TEXT NOT NULL);`);
const scope='openid email profile https://www.googleapis.com/auth/classroom.courses.readonly';
function callback(req:any){const origin=(process.env.APP_URL||req.protocol+'://'+req.get('host')).replace(/\/$/,'');return origin+'/api/classroom/callback';}
function back(res:any,status:string){res.redirect((process.env.FRONTEND_URL||'')+'/dashboard?classroom='+status);}
classroom.use(requireRole('student'));
classroom.get('/status',(req,res)=>{const a=db.prepare('SELECT email FROM classroom_accounts WHERE user_id=?').get(getSessionUser(req)!.id) as any;res.json({connected:!!a,email:a?.email,configured:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET)});});
classroom.get('/connect',(req,res)=>{if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET)return res.status(503).json({error:'Google Classroom is not configured.'});const state=randomToken();req.session.classroomState=state;req.session.save(error=>{if(error)return res.status(500).json({error:'Could not start Google connection.'});res.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID!,redirect_uri:callback(req),response_type:'code',scope,access_type:'offline',prompt:'consent',state}).toString());});});
classroom.get('/callback',async(req,res)=>{
 try{const {code,state}=req.query;if(typeof code!=='string'||typeof state!=='string'||state!==req.session.classroomState)return back(res,'failed');delete req.session.classroomState;
 const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,callback(req));const {tokens}=await client.getToken(code);if(!tokens.id_token||!tokens.access_token||!tokens.refresh_token)throw new Error('Incomplete grant');const ticket=await client.verifyIdToken({idToken:tokens.id_token,audience:process.env.GOOGLE_CLIENT_ID});const identity=ticket.getPayload();if(!identity?.email_verified||!identity.email)throw new Error('Unverified identity');
 const user=getSessionUser(req)!;const account=db.prepare('SELECT google_sub,email FROM users WHERE id=?').get(user.id) as any;if(account.google_sub?account.google_sub!==identity.sub:account.email.toLowerCase()!==identity.email.toLowerCase())throw new Error('Connect the Google account used for Academy sign-in');
 db.prepare('INSERT INTO classroom_accounts VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET access_token=excluded.access_token,refresh_token=excluded.refresh_token,expires_at=excluded.expires_at,email=excluded.email').run(user.id,encryptToken(tokens.access_token),encryptToken(tokens.refresh_token),tokens.expiry_date||Date.now()+3600000,identity.email);back(res,'connected');
 }catch{back(res,'failed');}
});
classroom.get('/courses',async(req,res)=>{
 try{const userId=getSessionUser(req)!.id,a=db.prepare('SELECT * FROM classroom_accounts WHERE user_id=?').get(userId) as any;if(!a)return res.status(409).json({error:'Connect Google Classroom first.'});const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET);client.setCredentials({access_token:decryptToken(a.access_token),refresh_token:decryptToken(a.refresh_token),expiry_date:a.expires_at});const {token}=await client.getAccessToken();if(!token)throw new Error('Missing token');if(client.credentials.access_token)db.prepare('UPDATE classroom_accounts SET access_token=?,expires_at=? WHERE user_id=?').run(encryptToken(client.credentials.access_token),client.credentials.expiry_date||Date.now()+3600000,userId);
 const response=await fetch('https://classroom.googleapis.com/v1/courses?pageSize=100&courseStates=ACTIVE',{headers:{Authorization:'Bearer '+token}});if(!response.ok)throw new Error('Classroom request failed');const data=await response.json();res.json({courses:(data.courses||[]).map((c:any)=>({id:c.id,name:c.name,section:c.section,url:c.alternateLink})),nextPageToken:data.nextPageToken||null});
 }catch{res.status(502).json({error:'Classroom could not load. Check API enablement or reconnect your Google account.'});}
});
classroom.post('/disconnect',async(req,res)=>{const id=getSessionUser(req)!.id,a=db.prepare('SELECT refresh_token FROM classroom_accounts WHERE user_id=?').get(id) as any;db.prepare('DELETE FROM classroom_accounts WHERE user_id=?').run(id);if(a){try{await new OAuth2Client().revokeToken(decryptToken(a.refresh_token));}catch{}}res.json({success:true});});
