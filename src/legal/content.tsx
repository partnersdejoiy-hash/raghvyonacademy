import type { ReactNode } from 'react';
import { CONTACT } from '../site/content';

export type Section = { id: string; title: string; body: ReactNode };
export type Doc = { title: string; lead: string; updated: string; sections: Section[] };

const Mail = () => <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;
const UPDATED = '19 October 2026';

export const PRIVACY: Doc = {
  title: 'Privacy policy',
  lead: 'What Raghvyon Academy collects, why, where it is kept, and how you can see or delete it.',
  updated: UPDATED,
  sections: [
    {
      id: 'who',
      title: 'Who we are',
      body: (
        <p>
          Raghvyon Academy is a tutoring academy run from {CONTACT.address}, India. This policy covers raghvyon.co.in, the student
          portal at /portal and the demo booking form. Questions go to <Mail /> or {CONTACT.phone}.
        </p>
      ),
    },
    {
      id: 'collect',
      title: 'What we collect',
      body: (
        <>
          <p>We only collect what we need to teach and to reply to you:</p>
          <ul>
            <li>
              <strong>Demo booking form:</strong> your name, the student's name, grade, subject, phone or WhatsApp number, email if you
              give it, your preferred time and any note you write.
            </li>
            <li>
              <strong>Google sign-in:</strong> your name, email address, profile photo and Google account ID. We never see your Google
              password and we do not ask for access to your Drive, Gmail or contacts.
            </li>
            <li>
              <strong>Email and password sign-in:</strong> if you create an account without Google, we store your name, email and a
              one-way scrypt hash of your password. We never store or see the password itself.
            </li>
            <li>
              <strong>Google Classroom and Calendar, only if you connect them:</strong> students and parents grant read-only access to
              the student's classes, coursework, grades, announcements and upcoming calendar events. Teachers grant access to create and
              manage their own classes, assignments, rosters and announcements, and to create calendar events with Google Meet links for
              their classes. We store an encrypted access key so the portal can read Classroom on your behalf; you can revoke
              it any time at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.
            </li>
            <li>
              <strong>Portal activity:</strong> the courses you add to your dashboard, and your role (student, parent or admin).
            </li>
            <li>
              <strong>Technical logs:</strong> our host keeps short-lived request logs (address, time, page) to keep the site secure
              and working.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'use',
      title: 'How we use it',
      body: (
        <ul>
          <li>To call or message you about a demo class you asked for.</li>
          <li>To sign you in and show your own courses on your dashboard.</li>
          <li>To plan classes, share class times and keep in touch about your child's learning.</li>
          <li>To keep the site secure and fix problems.</li>
        </ul>
      ),
    },
    {
      id: 'never',
      title: 'What we never do',
      body: (
        <p>
          We do not sell your data, rent it, or share it with advertisers. We do not run advertising trackers on this site. We do not
          send marketing messages you did not ask for.
        </p>
      ),
    },
    {
      id: 'where',
      title: 'Where it is stored',
      body: (
        <>
          <p>We use a small number of trusted services to run the site:</p>
          <ul>
            <li><strong>Vercel</strong> hosts the website and its server functions.</li>
            <li><strong>Cloudflare D1</strong> stores the database of bookings, accounts and course choices.</li>
            <li><strong>Google</strong> provides sign-in, Classroom, Calendar and Meet. Google's own privacy policy applies to your Google account. Our use of Google user data follows the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including its Limited Use requirements.</li>
            <li><strong>Google Fonts</strong> and <strong>Wikimedia Commons</strong> serve the typeface and the archive pictures, so your browser contacts them when the page loads.</li>
          </ul>
          <p>These services may process data outside India. Each is bound by its own security and privacy commitments.</p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies',
      body: (
        <p>
          We set one cookie, <code>rv_session</code>, only after you sign in. It keeps you signed in for up to 30 days, cannot be read
          by page scripts, and is removed when you sign out. Google's sign-in button may set its own cookies. We use no analytics or
          advertising cookies.
        </p>
      ),
    },
    {
      id: 'children',
      title: 'Children',
      body: (
        <p>
          Many of our students are under 18. A parent or guardian should book the demo and agree to classes. Students may sign in to
          the portal with a Google account their parent or school allows them to use. If you believe a child has given us details
          without a parent's knowledge, write to <Mail /> and we will delete them.
        </p>
      ),
    },
    {
      id: 'keep',
      title: 'How long we keep it',
      body: (
        <p>
          Demo requests are kept for up to 12 months if you do not join. Account and course details are kept while you study with us
          and deleted within 90 days of a written request after you leave. Technical logs expire on our host's own schedule.
        </p>
      ),
    },
    {
      id: 'rights',
      title: 'Your choices and rights',
      body: (
        <p>
          You can ask to see, correct or delete your data, or withdraw consent, at any time by writing to <Mail />. We reply within 30
          days. These rights follow India's Digital Personal Data Protection Act, 2023, and we extend them to every family we teach,
          wherever you live.
        </p>
      ),
    },
    {
      id: 'security',
      title: 'Security',
      body: (
        <p>
          The site runs only over HTTPS, sessions are signed and stored in a protected cookie, and database access is limited to our
          server with a restricted key. No system is perfect, so if something goes wrong we will tell affected families promptly.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      body: (
        <p>
          If this policy changes, we update the date above and, for important changes, tell signed-in users. For any privacy
          question or complaint, contact <Mail /> or call {CONTACT.phone}.
        </p>
      ),
    },
  ],
};

export const TERMS: Doc = {
  title: 'Terms of service',
  lead: 'The simple rules for classes, the free demo, fees, the student portal and this website.',
  updated: UPDATED,
  sections: [
    {
      id: 'agree',
      title: 'Agreeing to these terms',
      body: (
        <p>
          By booking a demo, joining classes or signing in to the portal, you agree to these terms. If you are booking for a child,
          you agree on their behalf as their parent or guardian.
        </p>
      ),
    },
    {
      id: 'classes',
      title: 'Classes we offer',
      body: (
        <p>
          Raghvyon Academy offers online and small-group tutoring in mathematics, science, English, spoken English, social studies,
          computer skills and exam preparation for Grades 2 to 12. Course details on this site describe the usual plan; the exact
          schedule and pace are agreed with each family.
        </p>
      ),
    },
    {
      id: 'demo',
      title: 'The free demo',
      body: (
        <p>
          The first demo class is free and carries no obligation to join. We confirm the time by phone or WhatsApp. If you cannot
          attend, tell us and we will offer another slot.
        </p>
      ),
    },
    {
      id: 'fees',
      title: 'Fees and payment',
      body: (
        <p>
          Fees depend on the subject, grade and batch, and are shared with you in writing after the demo. Fees are paid in advance
          for the period agreed. Any refund, missed-class or rescheduling arrangement is the one written in your fee confirmation.
        </p>
      ),
    },
    {
      id: 'conduct',
      title: 'Respect in class',
      body: (
        <p>
          We expect kind and respectful behaviour from students, parents and teachers alike. Recording classes or sharing class
          links with others needs our permission. We may pause classes if behaviour makes learning unsafe for others.
        </p>
      ),
    },
    {
      id: 'portal',
      title: 'The student portal',
      body: (
        <p>
          You sign in with Google and are responsible for keeping that account secure. Use the portal only for your own learning.
          Do not try to access other people's accounts or disrupt the service. We may suspend accounts that misuse it.
        </p>
      ),
    },
    {
      id: 'materials',
      title: 'Notes and materials',
      body: (
        <p>
          Notes, worksheets and explanations we share are for the enrolled student's personal study. Please do not resell or publish
          them. Work the student creates stays theirs.
        </p>
      ),
    },
    {
      id: 'results',
      title: 'Results',
      body: (
        <p>
          We teach carefully and track progress closely, but marks and exam results depend on many things outside our control, so
          we cannot guarantee a particular score or rank.
        </p>
      ),
    },
    {
      id: 'liability',
      title: 'Our responsibility',
      body: (
        <p>
          We provide the website as it is and work to keep it available. To the extent the law allows, our total responsibility for
          any claim is limited to the fees you paid us in the three months before it. Nothing here limits rights you have under
          Indian consumer law.
        </p>
      ),
    },
    {
      id: 'privacy',
      title: 'Your data',
      body: (
        <p>
          How we handle personal information is explained in our <a href="/privacy">privacy policy</a>, which forms part of these
          terms.
        </p>
      ),
    },
    {
      id: 'law',
      title: 'Changes, law and contact',
      body: (
        <p>
          We may update these terms and will change the date above when we do. These terms are governed by the laws of India, and
          the courts of New Delhi have jurisdiction. Questions go to <Mail /> or {CONTACT.phone}.
        </p>
      ),
    },
  ],
};
