const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseArguments,
  shouldDeleteDeployment,
} = require('./cleanup-stale-preview-deployments');

const previewDeployment = {
  target: null,
  created: Date.parse('2026-06-01T00:00:00.000Z'),
  meta: {
    githubCommitRef: 'closed-pr-branch',
  },
};

test('削除実行には期限指定を必須にする', () => {
  assert.throws(() => parseArguments(['--execute']), /--before/);
  assert.deepEqual(
    parseArguments(['--before', '2026-07-01', '--keep-branch', 'active-pr', '--execute']),
    {
      before: '2026-07-01',
      execute: true,
      keepBranches: ['active-pr'],
    },
  );
});

test('期限より古いPreviewだけを対象にし、Productionと除外ブランチを残す', () => {
  const options = {
    before: '2026-07-01',
    keepBranches: [],
  };

  assert.equal(shouldDeleteDeployment(previewDeployment, options), true);
  assert.equal(
    shouldDeleteDeployment({ ...previewDeployment, target: 'production' }, options),
    false,
  );
  assert.equal(
    shouldDeleteDeployment(previewDeployment, { ...options, keepBranches: ['closed-pr-branch'] }),
    false,
  );
});
