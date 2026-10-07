import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
process.env.NODE_ENV='test';const dir=fs.mkdtempSync(path.join(os.tmpdir(),'academy-ops-'));process.env.DATABASE_PATH=path.join(dir,'test.db');process.env.SESSION_SECRET='test-ops-only-secret';process.env.RAZORPAY_KEY_ID='mock_key';process.env.RAZORPAY_KEY_SECRET='mock_secret';
const {createApp}=await import('../server');const {db}=await import('../server/db');
const server=createApp().listen(0);await new Promise<void>(r=>server.on('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
const original=globalThis.fetch;let ordersCreated=0;
globalThis.fetch=async(input,init)=>{const url=String(input);if(url==='https://api.razorpay.com/v1/orders'){ordersCreated++;return Response.json({id:'order_mock'});}if(url==='https://api.razorpay.com/v1/orders/order_mock')return Response.json({id:'order_mock',status:'created'});if(url==='https://api.razorpay.com/v1/orders/order_mock/payments')return Response.json({items:[{id:'pay_mock',order_id:'order_mock',amount:250000,currency:'INR',status:'captured'}]});return original(input,init);};
async function call(jar:string|undefined,method:string,url:string,body?:any){const r=await fetch(base+url,{method,headers:{...(jar?{Cookie:jar}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
async function login(email:string){return (await call(undefined,'POST','/api/auth/login',{email,password:'demo1234'})).cookie!;}
try{
 const student=await login('aarav.sharma@student.raghvyon.com'),other=await login('ishita.verma@student.raghvyon.com'),parent=await login('sunita.sharma@parent.raghvyon.com'),admin=await login('admin@raghvyonacademy.com');
 const uid=(email:string)=>(db.prepare('SELECT id FROM users WHERE email=?').get(email) as any).id;
 const a=uid('aarav.sharma@student.raghvyon.com'),b=uid('ishita.verma@student.raghvyon.com');const course=(db.prepare('SELECT course_id FROM enrollments WHERE student_user_id=? LIMIT 1').get(a) as any).course_id;
 assert.equal((await call(student,'POST','/api/operations/attendance',{studentId:a,courseId:course,date:'2026-10-08',status:'present'})).status,403);
 assert.equal((await call(admin,'POST','/api/operations/attendance',{studentId:a,courseId:course,date:'2026-02-30',status:'present'})).status,400);
 assert.equal((await call(admin,'POST','/api/operations/attendance',{studentId:a,courseId:course,date:'2026-10-08',status:'present'})).status,200);
 assert.equal((await call(parent,'POST','/api/operations/leaves',{studentId:b,courseId:course,date:'2026-10-09',reason:'Family visit'})).status,403);
 assert.equal((await call(parent,'POST','/api/operations/leaves',{studentId:a,courseId:course,date:'2026-10-09',reason:'Family visit'})).status,201);
 let leave=(db.prepare('SELECT * FROM leave_requests').get() as any);assert.equal(leave.status,'pending');
 assert.equal((await call(student,'POST',`/api/operations/leaves/${leave.id}/review`,{status:'approved'})).status,403);
 assert.equal((await call(admin,'POST',`/api/operations/leaves/${leave.id}/review`,{status:'approved'})).status,200);
 assert.equal((db.prepare("SELECT status FROM attendance WHERE date='2026-10-09'").get() as any).status,'leave');
 await call(admin,'POST','/api/operations/teacher-assignment',{userId:b,courseId:course});assert.equal((await call(other,'POST','/api/operations/attendance',{studentId:a,courseId:course,date:'2026-10-10',status:'late'})).status,200);
 const forbidden=(db.prepare('SELECT id FROM courses WHERE id!=? LIMIT 1').get(course) as any).id;assert.equal((await call(other,'POST','/api/operations/attendance',{studentId:a,courseId:forbidden,date:'2026-10-10',status:'late'})).status,403);
 assert.equal((await call(admin,'POST','/api/operations/invoices',{studentId:a,title:'October tuition',amountPaise:250000,dueDate:'2026-10-15'})).status,201);
 const invoice=(db.prepare('SELECT id FROM fee_invoices').get() as any).id;
 assert.equal((await call(other,'POST',`/api/operations/invoices/${invoice}/order`)).status,403);
 assert.equal((await call(parent,'POST',`/api/operations/invoices/${invoice}/order`)).status,200);
 assert.equal((await call(parent,'POST',`/api/operations/invoices/${invoice}/order`)).status,200);assert.equal(ordersCreated,1);
 assert.equal((await call(parent,'POST','/api/operations/payments/verify',{orderId:'order_mock',paymentId:'pay_fake',signature:'0'.repeat(64)})).status,400);
 assert.equal((db.prepare('SELECT status FROM fee_invoices').get() as any).status,'due');
 assert.equal((await call(parent,'POST',`/api/operations/invoices/${invoice}/reconcile`)).body.paid,true);
 assert.equal((await call(parent,'POST',`/api/operations/invoices/${invoice}/reconcile`)).body.paid,true);
 assert.equal((await call(parent,'POST',`/api/operations/invoices/${invoice}/order`)).status,409);
 assert.equal((await call(parent,'GET','/api/classroom/status')).status,403);
 const r=await fetch(base+'/api/operations/attendance',{method:'POST',headers:{Cookie:admin,Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,403);
 console.log('Operations regression checks passed: attendance, parent leave, scoped teachers, invoices, forged payment, captured payment reconciliation and origin enforcement.');
}catch(e){console.error(e);process.exitCode=1;}finally{globalThis.fetch=original;await new Promise<void>(r=>server.close(()=>r()));db.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(process.exitCode||0);}
