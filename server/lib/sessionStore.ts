import session from 'express-session';
import { db } from '../db';
/** SQLite-backed sessions for a single backend with persistent database storage. */
export class SqliteSessionStore extends session.Store {
 constructor(){super();db.exec('CREATE TABLE IF NOT EXISTS sessions(sid TEXT PRIMARY KEY,data TEXT NOT NULL,expires_at INTEGER NOT NULL)');db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());}
 get(sid:string,callback:(error:any,session?:session.SessionData|null)=>void){try{const row=db.prepare('SELECT data,expires_at FROM sessions WHERE sid=?').get(sid) as any;if(!row||row.expires_at<Date.now()){if(row)db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);callback(null,null);}else callback(null,JSON.parse(row.data));}catch(error){callback(error);}}
 set(sid:string,data:session.SessionData,callback?: (error?:any)=>void){try{const expiry=data.cookie.expires?new Date(data.cookie.expires).getTime():Date.now()+7*86400000;db.prepare('INSERT INTO sessions VALUES(?,?,?) ON CONFLICT(sid) DO UPDATE SET data=excluded.data,expires_at=excluded.expires_at').run(sid,JSON.stringify(data),expiry);callback?.();}catch(error){callback?.(error);}}
 destroy(sid:string,callback?: (error?:any)=>void){try{db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);callback?.();}catch(error){callback?.(error);}}
 touch(sid:string,data:session.SessionData,callback?: (error?:any)=>void){this.set(sid,data,callback);}
}
