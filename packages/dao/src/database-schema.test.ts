import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveDatabaseSchema } from './database-schema';

test('Vercel PreviewではPRごとのスキーマを返す', () => {
  assert.equal(
    resolveDatabaseSchema({
      VERCEL_ENV: 'preview',
      DB_SCHEMA: 'preview_pr_142',
    }),
    'preview_pr_142',
  );
});

test('Vercel Previewでスキーマが未指定なら起動を拒否する', () => {
  assert.throws(
    () => resolveDatabaseSchema({ VERCEL_ENV: 'preview' }),
    /preview_pr_<PR番号>/,
  );

  assert.throws(
    () => resolveDatabaseSchema({ VERCEL_ENV: 'preview', DB_SCHEMA: 'public' }),
    /preview_pr_<PR番号>/,
  );
});

test('本番環境はpublicスキーマを既定値にする', () => {
  assert.equal(resolveDatabaseSchema({ VERCEL_ENV: 'production' }), 'public');
});
