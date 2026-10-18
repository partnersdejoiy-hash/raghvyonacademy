// Self-check for the session token used by the Vercel API. Run: node --import tsx tests/session.test.ts
import assert from 'node:assert/strict';
import { makeToken, readToken } from '../api/_lib.ts';

const secret = 'test-secret';
const t = makeToken(42, secret, 1000);
assert.equal(readToken(t, secret, 2000), 42, 'valid token reads back');
assert.equal(readToken(t, 'other-secret', 2000), null, 'wrong secret rejected');
assert.equal(readToken(t.replace(/^42/, '43'), secret, 2000), null, 'tampered id rejected');
assert.equal(readToken(t, secret, 1000 + 31 * 24 * 3600 * 1000), null, 'expired token rejected');
assert.equal(readToken(undefined, secret), null, 'missing token rejected');
console.log('session token: all checks passed');
