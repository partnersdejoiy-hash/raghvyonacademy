import { json, clearCookie } from '../_lib.js';

export const POST = () => json({ ok: true }, 200, { 'set-cookie': clearCookie() });
