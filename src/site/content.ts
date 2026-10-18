// Public-site content. Course rows come from the API; this file holds the fallback copy and pictures.
import { INITIAL_COURSES, INITIAL_TEACHER_PROFILE } from '../data/initialData';

export type Course = {
  id: number;
  slug: string;
  title: string;
  subject: string;
  description: string;
  grade_level: string;
  duration: string;
  fee: string;
  highlights: string[];
  syllabus: string[];
};

const SLUGS = ['mathematics', 'science', 'english', 'spoken-english', 'social-studies', 'computer-skills', 'exam-prep'];
const clean = (s: string) => s.replace(/\s*\(Placeholder\)/g, '');

/** Same rows as the D1 seed, so the page is complete even before the API answers. */
export const FALLBACK_COURSES: Course[] = INITIAL_COURSES.map((c, i) => ({
  id: i + 1,
  slug: SLUGS[i],
  title: c.title,
  subject: c.subject,
  description: c.description,
  grade_level: c.gradeLevel,
  duration: clean(c.duration),
  fee: clean(c.fee),
  highlights: c.highlights,
  syllabus: c.syllabusOverview.map((s) => s.replace(/^Module \d+:\s*/, '')),
}));

export const CONTACT = {
  phone: INITIAL_TEACHER_PROFILE.phone,
  phoneHref: 'tel:+918448736983',
  whatsapp: 'https://wa.me/918448736983',
  email: INITIAL_TEACHER_PROFILE.contactEmail,
  address: 'J-393, Dakshinpuri, New Delhi 110062',
};

/* Public-domain pictures from Wikimedia Commons. They show the world of each subject, never the academy itself. */
const commons = (file: string, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export type Picture = { file: string; alt: string; credit: string };

export const PICTURES: Record<string, Picture> = {
  mathematics: { file: 'Byrne_1847_Satz_des_Pythagoras_Hochformat.jpg', alt: "Oliver Byrne's 1847 coloured proof of Pythagoras' theorem", credit: 'Oliver Byrne, The Elements of Euclid, 1847' },
  science: { file: "Van_Leeuwenhoek's_microscopes_by_Henry_Baker.jpg", alt: "Engraving of Van Leeuwenhoek's microscopes", credit: 'Henry Baker, engraving of Van Leeuwenhoek’s microscopes, 18th c.' },
  english: { file: "Title_page_William_Shakespeare's_First_Folio_1623.jpg", alt: "Title page of Shakespeare's First Folio, 1623", credit: 'Martin Droeshout, First Folio title page, 1623' },
  'spoken-english': { file: 'Le_Gramophone_(la_meilleure_des_machines_parlantes)_affiche,_Louis-Charles_Bombled.jpg', alt: 'Early poster of a gramophone with a listening crowd', credit: 'Louis-Charles Bombled, Le Gramophone poster, c. 1900' },
  'social-studies': { file: 'The_Qutb_Minar_with_Robert_Smith’s_cupola,_c._1830.jpg', alt: 'The Qutb Minar in Delhi painted around 1830', credit: 'Company painting, The Qutb Minar with Robert Smith’s cupola, c. 1830' },
  'computer-skills': { file: 'Diagram_for_the_computation_of_Bernoulli_numbers.jpg', alt: "Ada Lovelace's 1843 table for computing Bernoulli numbers", credit: 'Ada Lovelace, Note G diagram, 1843' },
  'exam-prep': { file: 'Half-hour_sand_glass_MET_ES268.jpg', alt: 'An antique half-hour sand glass', credit: 'Half-hour sand glass, The Metropolitan Museum of Art (CC0)' },
  delhi: { file: 'Jantar_Mantar,_Delhi,_1826.jpg', alt: 'The Jantar Mantar observatory in Delhi, painted in 1826', credit: 'Jantar Mantar, Delhi, 1826' },
};

export const pictureUrl = (key: string, width?: number) => commons(PICTURES[key].file, width);

export const METHOD = [
  { name: 'Find the pace', text: 'The first lesson is a diagnostic. We see what your child already understands and set the speed of every class after it.' },
  { name: 'Ask why', text: 'Every new idea opens with a question, a drawing or an experiment. The formula arrives only once the reason for it is clear.' },
  { name: 'Use it', text: 'Real problems from money, maps, motion and language, so a rule learned on Monday is a tool by Friday.' },
  { name: 'Small feedback', text: 'Short, frequent notes on what went right and one thing to fix, never a pile of red ink.' },
  { name: 'Safe to be wrong', text: 'Mistakes are said out loud and worked through together. Confidence comes from being allowed to try.' },
];

export const FAQ = [
  { q: 'Is the first class really free?', a: 'Yes. The demo is a full lesson with the mentor, and booking it asks for no payment.' },
  { q: 'Are classes online or in Dakshinpuri?', a: 'Classes run online, so students in India and the US join from home. Families in South Delhi can ask about sessions at J-393, Dakshinpuri.' },
  { q: 'Which grades and boards do you teach?', a: 'Grade 2 to Grade 12, across CBSE, ICSE and US standards. Each course lists its exact grade range.' },
  { q: 'How do fees work?', a: 'Fees depend on the subject and the batch. We share them after the free demo and a short call with you.' },
  { q: 'We live in the US. What about time zones?', a: 'Tell us your city in the form. Classes are set in your local after-school or weekend hours.' },
  { q: 'What does my child need for class?', a: 'A laptop or tablet with a steady connection, headphones and a notebook. Concept notes are shared after each class.' },
];
