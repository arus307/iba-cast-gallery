const VERCEL_API_BASE_URL = 'https://api.vercel.com';
const DEPLOYMENTS_PAGE_SIZE = 100;

const requiredEnvironmentVariables = [
  'PR_NUMBER',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_IDS',
  'VERCEL_TOKEN',
];

const getRequiredEnvironment = () => {
  const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`必要な環境変数が設定されていません: ${missingVariables.join(', ')}`);
  }

  return {
    prNumber: process.env.PR_NUMBER,
    teamId: process.env.VERCEL_ORG_ID,
    projectIds: process.env.VERCEL_PROJECT_IDS.split(',').map((projectId) => projectId.trim()).filter(Boolean),
    token: process.env.VERCEL_TOKEN,
  };
};

const isPreviewDeployment = (deployment) => (
  deployment.target === null || typeof deployment.target === 'undefined'
);

const isTargetPreviewDeployment = (deployment, prNumber) => (
  isPreviewDeployment(deployment)
  && deployment.meta?.githubDeployment === '1'
  && deployment.meta?.githubPullRequestId === prNumber
);

const requestVercelApi = async (path, token, options = {}) => {
  const response = await fetch(`${VERCEL_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel API request failed (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
};

const listProjectDeployments = async ({ projectId, teamId, token }) => {
  const deployments = [];
  let until;

  do {
    const searchParams = new URLSearchParams({
      projectId,
      teamId,
      limit: String(DEPLOYMENTS_PAGE_SIZE),
    });

    if (until) {
      searchParams.set('until', String(until));
    }

    const result = await requestVercelApi(`/v6/deployments?${searchParams}`, token);
    deployments.push(...(result.deployments ?? []));
    until = result.pagination?.next;
  } while (until);

  return deployments;
};

const deleteProjectPreviewDeployments = async ({ projectId, prNumber, teamId, token }) => {
  const deployments = await listProjectDeployments({ projectId, teamId, token });
  const previewDeployments = deployments.filter((deployment) => isTargetPreviewDeployment(deployment, prNumber));

  if (previewDeployments.length === 0) {
    console.log(`PR #${prNumber} に紐づく Preview デプロイは ${projectId} にありません。`);
    return;
  }

  for (const deployment of previewDeployments) {
    console.log(`Preview デプロイを削除します: ${deployment.uid} (${deployment.url})`);
    await requestVercelApi(`/v13/deployments/${deployment.uid}?teamId=${encodeURIComponent(teamId)}`, token, {
      method: 'DELETE',
    });
  }
};

const main = async () => {
  const { prNumber, projectIds, teamId, token } = getRequiredEnvironment();

  if (projectIds.length === 0) {
    throw new Error('VERCEL_PROJECT_IDS に削除対象のプロジェクトIDを設定してください。');
  }

  for (const projectId of projectIds) {
    await deleteProjectPreviewDeployments({ projectId, prNumber, teamId, token });
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  isPreviewDeployment,
  isTargetPreviewDeployment,
};
