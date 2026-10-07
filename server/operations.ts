import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { db, isVerifiedParentOf } from './db';
import { getSessionUser, requireAuth, requireRole } from './lib/auth';
import { logAudit } from './lib/audit';
import { rateLimit } from './lib/rateLimit';
export const operations = Router();
db.exec(`
CREATE TABLE IF NOT EXISTS teaching_assignments(user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, PRIMARY KEY(user_id,course_id));
CREATE TABLE IF NOT EXISTS attendance(id INTEGER PRIMARY KEY,student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,date TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('present','absent','late','leave')),marked_by INTEGER NOT NULL REFERENCES users(id),UNIQUE(student_id,course_id,date));
CREATE TABLE IF NOT EXISTS leave_requests(id INTEGER PRIMARY KEY,student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,parent_id INTEGER NOT NULL REFERENCES users(id),date TEXT NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),reviewed_by INTEGER REFERENCES users(id),UNIQUE(student_id,course_id,date));
CREATE TABLE IF NOT EXISTS fee_invoices(id INTEGER PRIMARY KEY,student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,amount_paise INTEGER NOT NULL CHECK(amount_paise>0),due_date TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'due' CHECK(status IN ('due','paid')),paid_at TEXT);
CREATE TABLE IF NOT EXISTS payment_orders(order_id TEXT PRIMARY KEY,invoice_id INTEGER NOT NULL REFERENCES fee_invoices(id),payment_id TEXT UNIQUE,created_by INTEGER NOT NULL REFERENCES users(id));
`);
const id = z.coerce.number().int().positive();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v+'T00:00:00Z'); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v; });
function teaches(user: any, courseId: number) { return user.role === 'admin' || !!db.prepare('SELECT 1 FROM teaching_assignments WHERE user_id=? AND course_id=?').get(user.id, courseId); }
function owns(user: any, studentId: number) { return user.id === studentId && user.role === 'student' || user.role === 'parent' && isVerifiedParentOf(user.id,studentId); }
function enrolled(studentId: number, courseId: number) { return !!db.prepare('SELECT 1 FROM enrollments WHERE student_user_id=? AND course_id=?').get(studentId,courseId); }
function audit(req: any, message: string) { const u=getSessionUser(req)!; logAudit('ADMIN_ACTION',u.id,u.email,message,req.ip); }
operations.use(requireAuth);
operations.get('/overview', (req, res) => {
 const u=getSessionUser(req)!;
 const staffCourses=db.prepare('SELECT course_id FROM teaching_assignments WHERE user_id=?').all(u.id) as any[];
 let students: any[];
 if(u.role==='admin') students=db.prepare("SELECT id,name,email FROM users WHERE role='student'").all();
 else students=db.prepare(`SELECT DISTINCT u.id,u.name,u.email FROM users u WHERE u.id=? OR u.id IN (SELECT student_user_id FROM parent_student_links WHERE parent_user_id=? AND verified=1) OR u.id IN (SELECT e.student_user_id FROM enrollments e JOIN teaching_assignments t ON t.course_id=e.course_id WHERE t.user_id=?)`).all(u.id,u.id,u.id);
 const attendance=db.prepare(`SELECT a.*,c.title AS course_name FROM attendance a JOIN courses c ON c.id=a.course_id ORDER BY date DESC LIMIT 500`).all() as any[];
 const leaves=db.prepare('SELECT * FROM leave_requests ORDER BY date DESC LIMIT 500').all() as any[];
 const invoices=db.prepare('SELECT * FROM fee_invoices ORDER BY id DESC').all() as any[];
 res.json({isStaff:u.role==='admin'||staffCourses.length>0,students,courses:db.prepare('SELECT id,title FROM courses WHERE active=1').all(),attendance:attendance.filter(a=>owns(u,a.student_id)||teaches(u,a.course_id)),leaves:leaves.filter(a=>owns(u,a.student_id)||teaches(u,a.course_id)),invoices:invoices.filter(a=>u.role==='admin'||owns(u,a.student_id)),paymentsConfigured:!!(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET)});
});
operations.post('/accounts',requireRole('admin'),(req,res)=>{
 const p=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email(),role:z.enum(['student','parent'])}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Provide a name, email and student/parent role.'});const d=p.data;
 const existing=db.prepare('SELECT id,role FROM users WHERE email=?').get(d.email.toLowerCase()) as any;if(existing)return res.status(409).json({error:'Account already exists. Use its existing account ID.'});
 const result=db.prepare('INSERT INTO users(email,name,role) VALUES(?,?,?)').run(d.email.toLowerCase(),d.name,d.role);audit(req,'Provisioned Academy account');res.status(201).json({id:Number(result.lastInsertRowid)});
});
operations.post('/enroll',requireRole('admin'),(req,res)=>{
 const p=z.object({studentId:id,courseId:id}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Choose student and course.'});const d=p.data;if(!db.prepare("SELECT 1 FROM users WHERE id=? AND role='student'").get(d.studentId)||!db.prepare('SELECT 1 FROM courses WHERE id=?').get(d.courseId))return res.status(400).json({error:'Student or course not found.'});db.prepare('INSERT OR IGNORE INTO enrollments(student_user_id,course_id) VALUES(?,?)').run(d.studentId,d.courseId);audit(req,'Student enrolled');res.json({success:true});
});
operations.post('/teacher-assignment' ,requireRole('admin'),(req,res)=>{
 const p=z.object({userId:id,courseId:id}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Choose a teacher account and course.'});
 if(!db.prepare('SELECT id FROM users WHERE id=?').get(p.data.userId)||!db.prepare('SELECT id FROM courses WHERE id=?').get(p.data.courseId))return res.status(404).json({error:'Account or course not found.'});
 db.prepare('INSERT OR IGNORE INTO teaching_assignments VALUES (?,?)').run(p.data.userId,p.data.courseId);audit(req,'Assigned teaching account to course');res.json({success:true});
});
operations.post('/parent-link',requireRole('admin'),(req,res)=>{
 const p=z.object({parentId:id,studentId:id}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Choose parent and student accounts.'});
 if(!db.prepare("SELECT 1 FROM users WHERE id=? AND role='parent'").get(p.data.parentId)||!db.prepare("SELECT 1 FROM users WHERE id=? AND role='student'").get(p.data.studentId))return res.status(400).json({error:'Parent and student roles must already be verified by the Academy.'});
 db.prepare('INSERT INTO parent_student_links(parent_user_id,student_user_id,verified) VALUES(?,?,1) ON CONFLICT(parent_user_id,student_user_id) DO UPDATE SET verified=1').run(p.data.parentId,p.data.studentId);audit(req,'Verified parent-child link');res.json({success:true});
});
operations.post('/attendance',(req,res)=>{
 const p=z.object({studentId:id,courseId:id,date,status:z.enum(['present','absent','late','leave'])}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Select a student, course, date and attendance status.'});const d=p.data,u=getSessionUser(req)!;
 if(!teaches(u,d.courseId))return res.status(403).json({error:'Only the assigned teacher can mark attendance.'});
 if(!enrolled(d.studentId,d.courseId))return res.status(400).json({error:'Student must be enrolled in this course.'});
 db.prepare('INSERT INTO attendance(student_id,course_id,date,status,marked_by) VALUES(?,?,?,?,?) ON CONFLICT(student_id,course_id,date) DO UPDATE SET status=excluded.status,marked_by=excluded.marked_by').run(d.studentId,d.courseId,d.date,d.status,u.id);audit(req,'Attendance recorded');res.json({success:true});
});
operations.post('/leaves',requireRole('parent'),(req,res)=>{
 const p=z.object({studentId:id,courseId:id,date,reason:z.string().trim().min(3).max(500)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Provide a date, course and leave reason.'});const d=p.data,u=getSessionUser(req)!;
 if(!isVerifiedParentOf(u.id,d.studentId))return res.status(403).json({error:'You can request leave only for your verified child.'});
 if(!enrolled(d.studentId,d.courseId))return res.status(400).json({error:'Student is not enrolled in this course.'});
 const existing=db.prepare('SELECT id FROM leave_requests WHERE student_id=? AND course_id=? AND date=?').get(d.studentId,d.courseId,d.date);if(existing)return res.status(409).json({error:'A leave request already exists for this class and date.'});
 db.prepare('INSERT INTO leave_requests(student_id,course_id,parent_id,date,reason) VALUES(?,?,?,?,?)').run(d.studentId,d.courseId,u.id,d.date,d.reason);audit(req,'Parent requested leave');res.status(201).json({success:true});
});
operations.post('/leaves/:id/review',(req,res)=>{
 const p=z.object({status:z.enum(['approved','rejected'])}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Choose approved or rejected.'});const l=db.prepare('SELECT * FROM leave_requests WHERE id=?').get(Number(req.params.id)) as any,u=getSessionUser(req)!;
 if(!l)return res.status(404).json({error:'Leave request not found.'});if(!teaches(u,l.course_id))return res.status(403).json({error:'Only the assigned teacher can review this request.'});
 if(l.status!=='pending')return res.status(409).json({error:'This request has already been reviewed.'});
 db.transaction(()=>{db.prepare('UPDATE leave_requests SET status=?,reviewed_by=? WHERE id=?').run(p.data.status,u.id,l.id);if(p.data.status==='approved')db.prepare('INSERT INTO attendance(student_id,course_id,date,status,marked_by) VALUES(?,?,?,\'leave\',?) ON CONFLICT(student_id,course_id,date) DO UPDATE SET status=\'leave\',marked_by=excluded.marked_by').run(l.student_id,l.course_id,l.date,u.id);})();audit(req,'Leave request reviewed');res.json({success:true});
});
operations.post('/invoices',requireRole('admin'),(req,res)=>{
 const p=z.object({studentId:id,title:z.string().trim().min(2).max(100),amountPaise:z.number().int().min(100).max(100000000),dueDate:date}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Enter a student, description, amount and due date.'});const d=p.data;
 if(!db.prepare("SELECT 1 FROM users WHERE id=? AND role='student'").get(d.studentId))return res.status(400).json({error:'Student not found.'});
 db.prepare('INSERT INTO fee_invoices(student_id,title,amount_paise,due_date) VALUES(?,?,?,?)').run(d.studentId,d.title,d.amountPaise,d.dueDate);audit(req,'Fee invoice created');res.status(201).json({success:true});
});
const creatingOrders = new Set<number>();
async function razorpay(path:string,body?:unknown){
 if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)throw new Error('PAYMENTS_NOT_CONFIGURED');
 const r=await fetch('https://api.razorpay.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Basic '+Buffer.from(process.env.RAZORPAY_KEY_ID+':'+process.env.RAZORPAY_KEY_SECRET).toString('base64'),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error('PAYMENT_PROVIDER_ERROR');return r.json();
}
operations.post('/invoices/:id/order',rateLimit({windowMs:60000,max:10}),async(req,res)=>{
 try{const i=db.prepare('SELECT * FROM fee_invoices WHERE id=?').get(Number(req.params.id)) as any,u=getSessionUser(req)!;if(!i||!owns(u,i.student_id))return res.status(403).json({error:'Invoice is not available to this account.'});if(i.status==='paid')return res.status(409).json({error:'Invoice already paid.'});
 const previous=db.prepare('SELECT order_id FROM payment_orders WHERE invoice_id=? ORDER BY rowid DESC LIMIT 1').get(i.id) as any;
 if(previous){const existing=await razorpay('orders/'+encodeURIComponent(previous.order_id));if(existing.status==='paid')return res.status(409).json({error:'A payment exists. Use Check payment status to update your invoice.'});return res.json({orderId:existing.id,keyId:process.env.RAZORPAY_KEY_ID,amount:i.amount_paise,currency:'INR'});}
 if(creatingOrders.has(i.id))return res.status(409).json({error:'Payment checkout is being prepared. Please retry shortly.'});creatingOrders.add(i.id);
 let o:any;try{o=await razorpay('orders',{amount:i.amount_paise,currency:'INR',receipt:'academy_'+i.id});}finally{creatingOrders.delete(i.id);}
 db.prepare('INSERT INTO payment_orders(order_id,invoice_id,created_by) VALUES(?,?,?)').run(o.id,i.id,u.id);res.json({orderId:o.id,keyId:process.env.RAZORPAY_KEY_ID,amount:i.amount_paise,currency:'INR'});
 }catch{res.status(503).json({error:'Payments are unavailable. Please contact the Academy.'});}
});
operations.post('/invoices/:id/reconcile',async(req,res)=>{
 try{const i=db.prepare('SELECT * FROM fee_invoices WHERE id=?').get(Number(req.params.id)) as any,u=getSessionUser(req)!;if(!i||!owns(u,i.student_id))return res.status(403).json({error:'Invoice unavailable.'});
 if(i.status==='paid')return res.json({paid:true});const orders=db.prepare('SELECT order_id FROM payment_orders WHERE invoice_id=? ORDER BY rowid DESC LIMIT 10').all(i.id) as any[];
 for(const order of orders){const payments=await razorpay('orders/'+encodeURIComponent(order.order_id)+'/payments');const payment=payments.items?.find((p:any)=>p.status==='captured'&&p.order_id===order.order_id&&p.currency==='INR'&&p.amount===i.amount_paise);if(payment){db.transaction(()=>{db.prepare('UPDATE payment_orders SET payment_id=? WHERE order_id=?').run(payment.id,order.order_id);db.prepare("UPDATE fee_invoices SET status='paid',paid_at=datetime('now') WHERE id=? AND status='due'").run(i.id);})();audit(req,'Fee payment reconciled from provider');return res.json({paid:true});}}
 res.json({paid:false});}catch{res.status(503).json({error:'Could not check payment status. Please retain your receipt.'});}
});
operations.post('/payments/verify' ,async(req,res)=>{
 try{const p=z.object({orderId:z.string().max(100),paymentId:z.string().max(100),signature:z.string().regex(/^[a-f0-9]{64}$/)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid payment confirmation.'});const d=p.data,u=getSessionUser(req)!;
 const order=db.prepare('SELECT o.*,i.student_id,i.amount_paise FROM payment_orders o JOIN fee_invoices i ON i.id=o.invoice_id WHERE order_id=?').get(d.orderId) as any;if(!order||!owns(u,order.student_id))return res.status(403).json({error:'Payment belongs to another account.'});
 if(!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({error:'Payments not configured.'});const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(order.order_id+'|'+d.paymentId).digest();if(!crypto.timingSafeEqual(expected,Buffer.from(d.signature,'hex')))return res.status(400).json({error:'Payment signature verification failed.'});
 const payment=await razorpay('payments/'+encodeURIComponent(d.paymentId));if(payment.order_id!==order.order_id||payment.amount!==order.amount_paise||payment.currency!=='INR'||payment.status!=='captured')return res.status(409).json({error:'Payment is not captured yet. Refresh payment status shortly.'});
 db.transaction(()=>{db.prepare('UPDATE payment_orders SET payment_id=? WHERE order_id=?').run(d.paymentId,order.order_id);db.prepare("UPDATE fee_invoices SET status='paid',paid_at=datetime('now') WHERE id=? AND status='due'").run(order.invoice_id);})();audit(req,'Captured fee payment verified');res.json({success:true});
 }catch{res.status(503).json({error:'Payment verification unavailable. Please keep your payment receipt and contact the Academy.'});}
});
