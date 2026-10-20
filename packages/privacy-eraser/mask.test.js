import test from 'node:test';
import assert from 'node:assert/strict';
import { maskJson, maskText } from './mask.js';

test('masks common identifiers and secrets', () => {
  const result = maskText('메일 a.user@example.com 전화 010-1234-5678 키 sk-abcdefghijklmnop');
  assert.match(result, /\*+@example\.com/); assert.doesNotMatch(result, /010-1234-5678/); assert.doesNotMatch(result, /sk-abcdefghijklmnop/);
});
test('masks sensitive JSON keys recursively', () => {
  const result = maskJson({ name: '홍길동', nested: { email: 'a@example.com' }, note: '01012345678' });
  assert.equal(result.name, '***'); assert.equal(result.nested.email, '***'); assert.match(result.note, /\*/);
});

