import { json } from './_lib.js';

// Public browser config. The OAuth client ID is not a secret; serving it here means only GOOGLE_CLIENT_ID needs setting.
export const GET = () => json({ googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || null });
