# Academy operations setup

The GitHub Pages site is a public design preview. Attendance, leave, invoices,
Google connections and admin sessions run on the Express backend; they are not
activated by publishing static files.

## Owner and contact

Public phone / WhatsApp: +91 8448736983.
The Render blueprint configures ADMIN_EMAIL=deepak.sharma@dejoiy.com.
Set ADMIN_PASSWORD privately in the backend host's environment. At startup the
server stores a bcrypt cost-12 hash and provisions the owner account. No real
password is committed or sent to the public frontend. The owner can also sign
in using a verified Google identity matching ADMIN_EMAIL.

## Deploy the full app

1. Connect this GitHub repository to a Node web service (Render blueprint is
   included). Build: `npm ci && npm run build`; start: `npm start`.
2. Configure ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET, GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET, APP_URL (the HTTPS backend address), and Razorpay keys.
3. Use persistent disk for DATABASE_PATH. Sessions, accounts, attendance,
   parent links, invoices and OAuth grants are stored in SQLite. Ephemeral
   disk is suitable only for a disposable demo. Use one backend instance.
4. The full backend serves the website itself. Use that URL for operational
   logins/payments. The GitHub Pages workflow deliberately stays a static preview.
5. Add the HTTPS OAuth callbacks below in Google Cloud and enable Drive and
   Classroom APIs. Configure consent/testing users and any scope verification
   required by Google before public launch.

Callbacks (replace `<backend>`):

- `<backend>/api/auth/google/callback`
- `<backend>/api/drive/oauth2callback`
- `<backend>/api/classroom/callback`

Google sign-in creates an Academy student account, not a personal Gmail account.
Students explicitly connect their existing Drive and Classroom accounts with
Google consent. Drive requests openid/email/profile plus drive.file and verifies
ID tokens. Classroom separately requests classroom.courses.readonly plus identity
scopes; it verifies the signed-in identity and displays up to 100 class links.
It does not create/enrol Classroom courses or sync all assignments.

## Staff and parents

Admin operations panel can provision a parent/student account, enrol students,
verify parent-child links and assign a teaching account to courses. Teacher
access is an explicit teaching_assignments relationship on an existing Academy
account; it is not a global admin grant. The existing base role remains student
or parent. Assigned teachers see only enrolled pupils for their assigned course
and mark/review attendance and leave for that course. The owner can oversee all.

Parents can request leave only for verified children and enrolled courses. Leave
starts pending. The assigned teacher or owner approves/rejects it. Approval
records attendance as leave; parents cannot forge attendance or approve their
own request. Recorded attendance, rather than a placeholder 100%, drives progress.

## Razorpay fees

Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET privately on the backend, starting
with test-mode keys. The admin creates an INR invoice in paise. Students or
verified parents create checkout orders for their own invoice. The server uses
the database amount, verifies the HMAC signature and independently fetches the
payment to confirm captured status, matching order, amount and currency. The
browser cannot mark an invoice paid. Existing orders are reused; local creation
locking applies to the supported single backend instance.

If checkout closes or the browser loses connection, Check payment status fetches
captured payments for the stored order directly from Razorpay and reconciles the
receipt idempotently. There is no background webhook reconciliation or refund
workflow yet. Never ask for a second payment before checking provider status.
Use Razorpay's dashboard for refunds/settlement and test the full checkout in
staging before collecting real fees. Keys are never embedded in Pages; only the
public key ID is returned to an authenticated checkout request.

## Validation and limitations

Run npm run lint, npm run build, npm run test:security, npm run test:auth and
npm run test:operations. Operations tests use mocked Razorpay responses; real
checkout and Google callbacks still need staging validation. Browser visual QA
has not been completed in this workspace. Classroom scope consent, teacher setup,
parent verification and gateway merchant activation are required configuration,
not features that a static deployment can silently activate.

The animation reference is adapted with a desktop sticky learning journey,
scroll-linked camera/rotation and changing explanatory chapters. Mobile uses a
normal page flow; reduced-motion users get a stationary scene. The family portal
walkthrough is labelled as a design preview and contains no claimed live records.
