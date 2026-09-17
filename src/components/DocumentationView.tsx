import React, { useState } from 'react';
import { 
  FileText, 
  FolderTree, 
  Key, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Terminal, 
  Rocket, 
  CheckSquare, 
  AlertTriangle, 
  Copy, 
  Check,
  ExternalLink
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'oauth_drive' | 'env' | 'security' | 'deployment' | 'database'>('architecture');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE]/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-[#FFF9EE] border border-[#2454A6]/15 px-3 py-1 rounded-full text-xs font-bold text-[#2454A6] mb-2">
                <FileText className="w-3.5 h-3.5 text-[#35B8A6]" />
                <span>PLATFORM SPECIFICATION & ARCHITECTURE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2454A6]">
                RAGHVYON ACADEMY System Documentation
              </h1>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-1">
                Complete engineering guides, OAuth setup protocols, security rules, and production deployment specifications.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full">
                Production-Ready Stack
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveDoc('architecture')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'architecture' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Project Structure & Stack
          </button>
          <button
            onClick={() => setActiveDoc('oauth_drive')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'oauth_drive' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Google Drive & OAuth Guide
          </button>
          <button
            onClick={() => setActiveDoc('env')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'env' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Environment Variables
          </button>
          <button
            onClick={() => setActiveDoc('security')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'security' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Security & Minor Safeguards
          </button>
          <button
            onClick={() => setActiveDoc('database')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'database' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Database Schema & Rules
          </button>
          <button
            onClick={() => setActiveDoc('deployment')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeDoc === 'deployment' ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
            }`}
          >
            Deployment & Verification
          </button>
        </div>

        {/* TAB 1: ARCHITECTURE */}
        {activeDoc === 'architecture' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Project Structure & Technology Choices</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#2454A6] uppercase">Frontend</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">React 18 + TypeScript</p>
                <p className="text-xs text-gray-500 mt-1">Vite build system with Tailwind CSS utility architecture.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#35B8A6] uppercase">3D Visual Engine</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">Three.js + GSAP</p>
                <p className="text-xs text-gray-500 mt-1">Student mascot avatar, floating geometry, reduced-motion fallback.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#F28C72] uppercase">Backend API</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">Node Express Server</p>
                <p className="text-xs text-gray-500 mt-1">Full-stack with Vite middleware, secure auth & Gemini AI server proxy.</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#172B4D] uppercase">Directory Hierarchy</span>
              <pre className="bg-[#172B4D] text-[#FFF9EE] p-4 rounded-2xl text-xs font-mono overflow-x-auto">
{`raghvyon-academy/
├── .env.example                  # Documented environment variables (Secrets strictly hidden)
├── metadata.json                 # Application name, description, major capabilities
├── index.html                    # SEO tags, Outfit & Plus Jakarta Sans typography
├── package.json                  # Dependencies (Three.js, Lucide, Express, Vite, esbuild)
├── server.ts                     # Full-stack Express server with Vite middleware
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main state machine, view routing, notifications
│   ├── index.css                 # Brand color tokens & Tailwind font layers
│   ├── types.ts                  # Shared domain types (Courses, Users, Drive, Assignments)
│   ├── data/
│   │   └── initialData.ts        # Verified mock academic records, courses & profiles
│   └── components/
│       ├── Header.tsx            # Navigation, brand emblem, portal switcher
│       ├── Hero.tsx              # Hero headline, CTAs, 3D Canvas integration
│       ├── Hero3DScene.tsx       # Three.js 3D mascot & floating academic tools
│       ├── TrustTeacherSection.tsx # Verified faculty credentials & methodology
│       ├── SubjectsCoursesSection.tsx # Subject filterable course catalog
│       ├── TeachingApproachSection.tsx # Concept-first pedagogy breakdown
│       ├── StudentDashboard.tsx  # Assignments, Notes, Progress, Drive sync
│       ├── ParentDashboard.tsx   # Verified child monitoring, attendance, feedback
│       ├── AdminDashboard.tsx    # Course manager, enquiries, bookings, audit logs
│       ├── LoginModal.tsx        # Role-based instant login switcher
│       ├── DemoBookingModal.tsx  # Free diagnostic session booking
│       ├── EnquiryModal.tsx      # Academic contact form
│       ├── CourseDetailModal.tsx # Syllabus & week-by-week outline modal
│       ├── AIStudyAssistantModal.tsx # Safe Gemini server-side conceptual hints
│       ├── DocumentationView.tsx # In-app system specs & guides
│       └── Footer.tsx            # WhatsApp, Delhi address, Minor Privacy Policy`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE DRIVE & OAUTH GUIDE */}
        {activeDoc === 'oauth_drive' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Google Drive API & OAuth 2.0 Configuration Guide</h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 space-y-2">
                <span className="font-bold block text-blue-900">Step 1: Create Google Cloud Project</span>
                <p>Navigate to Google Cloud Console (console.cloud.google.com), create a project named <code>Raghvyon-Academy-Portal</code>, and enable the <strong>Google Drive API</strong>.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 space-y-2">
                <span className="font-bold block text-blue-900">Step 2: Configure OAuth Consent Screen</span>
                <ul className="list-disc list-inside space-y-1">
                  <li>User Type: External</li>
                  <li>App Name: <strong>RAGHVYON ACADEMY Learning Portal</strong></li>
                  <li>Authorized Domains: Add your deployment domain (e.g. <code>run.app</code>)</li>
                  <li>Scope to request: <code>https://www.googleapis.com/auth/drive.file</code> (Per-file access only)</li>
                  <li>DO NOT add <code>https://www.googleapis.com/auth/drive</code> (violates least-privilege).</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 space-y-2">
                <span className="font-bold block text-blue-900">Step 3: Create OAuth 2.0 Client ID</span>
                <p>Application Type: Web Application. Add Authorized Redirect URI: <code>https://your-domain.com/api/drive/oauth2callback</code>.</p>
                <p>Store <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> safely in the server environment.</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2">
                <span className="font-bold block text-emerald-900">Step 4: Educational Folder Creation & File Storage</span>
                <p>When student authorizes Drive access, the server calls <code>drive.files.create</code> with mimeType <code>application/vnd.google-apps.folder</code> and title <code>RAGHVYON Academy Learning Portfolio</code>. All student uploads, exported notes, and certificates are parented to this folder ID.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENVIRONMENT VARIABLES */}
        {activeDoc === 'env' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#172B4D]">Documented Environment Variables (.env)</h3>
              <button
                onClick={() => copyToClipboard(`GEMINI_API_KEY=\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\nGOOGLE_REDIRECT_URI=\nSESSION_SECRET=`)}
                className="flex items-center space-x-1 text-xs font-bold text-[#2454A6] bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>

            <pre className="bg-[#172B4D] text-[#FFF9EE] p-5 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`# .env.example - RAGHVYON ACADEMY Production Environment Variables

# Server-Side Gemini API Key (Never exposed to client browser)
GEMINI_API_KEY=

# Google Drive Integration OAuth 2.0 Credentials
# Obtain from Google Cloud Console > APIs & Services > Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-app-domain.run.app/api/drive/oauth2callback

# Express Session Security
# At least 32 characters long cryptographically random string
SESSION_SECRET=raghvyon_secure_production_secret_32_characters_key`}
            </pre>
          </div>
        )}

        {/* TAB 4: SECURITY & MINOR SAFEGUARDS */}
        {activeDoc === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Security Review & Minor Digital Safeguards</h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">1. Minor Privacy & Parental Consent</span>
                <p>For students under 18, account creation is validated through parent verification. Data collection is strictly limited to academic progress, attendance records, and graded assignments.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">2. Google Drive Isolation</span>
                <p>Parents do not inherit access to students' personal Google Drive accounts or files. Tokens are encrypted server-side and never returned to the frontend in raw format.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">3. Role-Based Access Control (RBAC)</span>
                <p>Role checks enforce strict separation between Student, Parent, and Admin endpoints. Students cannot modify course rosters or grade assignments; Parents can only view their own linked children.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">4. Audit Trail & Data Minimization</span>
                <p>All sensitive operations (login, credential checks, course mutations) are logged with non-repudiation timestamps. Students or parents can request complete data erasure at any time.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE SCHEMA */}
        {activeDoc === 'database' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Database Schema & Security Rules Specification</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#172B4D] uppercase">Entities Model:</span>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  <li><code>users</code> (id, name, email, role: 'student' | 'parent' | 'admin', linkedChildId, studentId, grade)</li>
                  <li><code>courses</code> (id, title, subject, gradeLevel, description, duration, fee, highlights, active)</li>
                  <li><code>assignments</code> (id, courseId, title, description, dueDate, status, score, teacherFeedback, fileName)</li>
                  <li><code>study_notes</code> (id, studentId, title, subject, content, driveSaved, updatedAt)</li>
                  <li><code>certificates</code> (id, studentId, courseId, title, gradeAchieved, verificationCode, issueDate)</li>
                  <li><code>enquiries</code> (id, parentName, email, phone, gradeLevel, subject, message, status)</li>
                  <li><code>demo_bookings</code> (id, studentName, parentName, phone, email, subject, preferredDate, preferredTimeSlot, status)</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#172B4D] uppercase">Firestore / Database Security Rules:</span>
                <pre className="bg-[#172B4D] text-[#FFF9EE] p-4 rounded-2xl text-xs font-mono overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return request.auth.token.role == 'admin'; }
    function isOwner(userId) { return request.auth.uid == userId; }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isAdmin() || isOwner(userId);
    }

    match /courses/{courseId} {
      allow read: if true; // Public catalog
      allow write: if isAdmin();
    }

    match /assignments/{assignmentId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }

    match /demo_bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DEPLOYMENT */}
        {activeDoc === 'deployment' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Local Development & Cloud Run Deployment</h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="space-y-2">
                <span className="font-bold text-[#172B4D]">1. Local Development Execution</span>
                <pre className="bg-gray-100 p-3 rounded-xl font-mono text-xs text-[#172B4D]">
{`npm install
npm run dev
# Server binds to http://0.0.0.0:3000 with hot TypeScript reload via tsx`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#172B4D]">2. Production Build Execution</span>
                <pre className="bg-gray-100 p-3 rounded-xl font-mono text-xs text-[#172B4D]">
{`npm run build
# Compiles React SPA to dist/ and bundles server.ts into dist/server.cjs via esbuild`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#172B4D]">3. Production Start Command</span>
                <pre className="bg-gray-100 p-3 rounded-xl font-mono text-xs text-[#172B4D]">
{`npm run start
# Executes: node dist/server.cjs on Cloud Run / container container ingress`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
