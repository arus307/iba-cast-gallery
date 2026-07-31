const test = require('node:test');
const assert = require('node:assert/strict');

const { isTargetPreviewDeployment } = require('./delete-preview-deployments');

test('同じPR番号を持つGitHub Previewデプロイだけを削除対象にする', () => {
  assert.equal(
    isTargetPreviewDeployment({
      target: null,
      meta: {
        githubDeployment: '1',
        githubPullRequestId: '142',
      },
    }, '142'),
    true,
  );
});

test('本番デプロイと別PRのデプロイは削除対象にしない', () => {
  assert.equal(
    isTargetPreviewDeployment({
      target: 'production',
      meta: {
        githubDeployment: '1',
        githubPullRequestId: '142',
      },
    }, '142'),
    false,
  );

  assert.equal(
    isTargetPreviewDeployment({
      target: 'staging',
      meta: {
        githubDeployment: '1',
        githubPullRequestId: '142',
      },
    }, '142'),
    false,
  );

  assert.equal(
    isTargetPreviewDeployment({
      target: null,
      meta: {
        githubDeployment: '1',
        githubPullRequestId: '141',
      },
    }, '142'),
    false,
  );
});
