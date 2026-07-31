const VERCEL_API_BASE_URL = 'https://api.vercel.com';
const DEPLOYMENTS_PAGE_SIZE = 100;

const usage = `使用方法:
  node scripts/cleanup-stale-preview-deployments.js [--before YYYY-MM-DD] [--keep-branch ブランチ名] [--execute]

必要な環境変数:
  VERCEL_TOKEN       Vercelのアクセストークン
  VERCEL_ORG_ID      VercelのチームID
  VERCEL_PROJECT_IDS カンマ区切りのVercelプロジェクトID

既定では削除せず、対象一覧だけを表示します。
削除するには --before と --execute を併用してください。`;

const parseArguments = (arguments_) => {
  const options = {
    execute: false,
    keepBranches: [],
  };

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === '--execute') {
      options.execute = true;
      continue;
    }

    if (argument === '--before' || argument === '--keep-branch') {
      const value = arguments_[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} の値を指定してください。`);
      }

      if (argument === '--before') {
        if (options.before) {
          throw new Error('--before は1回だけ指定してください。');
        }
        options.before = value;
      } else {
        options.keepBranches.push(value);
      }

      index += 1;
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    throw new Error(`不明なオプションです: ${argument}`);
  }

  if (options.before && Number.isNaN(Date.parse(options.before))) {
    throw new Error('--before には YYYY-MM-DD またはISO 8601形式の日時を指定してください。');
  }

  if (options.execute && !options.before) {
    throw new Error('削除するには --before を指定してください。');
  }

  return options;
};

const getRequiredEnvironment = () => {
  const requiredEnvironmentVariables = ['VERCEL_ORG_ID', 'VERCEL_PROJECT_IDS', 'VERCEL_TOKEN'];
  const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`必要な環境変数が設定されていません: ${missingVariables.join(', ')}`);
  }

  const projectIds = process.env.VERCEL_PROJECT_IDS
    .split(',')
    .map((projectId) => projectId.trim())
    .filter(Boolean);

  if (projectIds.length === 0) {
    throw new Error('VERCEL_PROJECT_IDS に削除対象のプロジェクトIDを設定してください。');
  }

  return {
    projectIds,
    teamId: process.env.VERCEL_ORG_ID,
    token: process.env.VERCEL_TOKEN,
  };
};

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

const getDeploymentCreatedAt = (deployment) => {
  const createdAt = deployment.createdAt ?? deployment.created;
  const timestamp = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt ?? '');

  return Number.isNaN(timestamp) ? undefined : timestamp;
};

const isPreviewDeployment = (deployment) => (
  deployment.target === null || typeof deployment.target === 'undefined'
);

const shouldDeleteDeployment = (deployment, options) => {
  if (!isPreviewDeployment(deployment)) {
    return false;
  }

  if (options.keepBranches.includes(deployment.meta?.githubCommitRef)) {
    return false;
  }

  if (!options.before) {
    return true;
  }

  const createdAt = getDeploymentCreatedAt(deployment);
  return createdAt !== undefined && createdAt < Date.parse(options.before);
};

const formatDeployment = (deployment) => {
  const createdAt = getDeploymentCreatedAt(deployment);
  const createdAtLabel = createdAt ? new Date(createdAt).toISOString() : '日時不明';
  const branch = deployment.meta?.githubCommitRef ?? 'ブランチ情報なし';

  return `${createdAtLabel}  ${branch}  ${deployment.url ?? deployment.uid}`;
};

const deleteDeployment = async ({ deployment, teamId, token }) => {
  console.log(`Preview デプロイを削除します: ${deployment.uid} (${deployment.url})`);
  await requestVercelApi(`/v13/deployments/${deployment.uid}?teamId=${encodeURIComponent(teamId)}`, token, {
    method: 'DELETE',
  });
};

const main = async () => {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage);
    return;
  }

  const { projectIds, teamId, token } = getRequiredEnvironment();
  const deploymentsByProject = await Promise.all(projectIds.map(async (projectId) => ({
    projectId,
    deployments: await listProjectDeployments({ projectId, teamId, token }),
  })));

  const candidates = deploymentsByProject.flatMap(({ projectId, deployments }) => deployments
    .filter((deployment) => shouldDeleteDeployment(deployment, options))
    .map((deployment) => ({ ...deployment, projectId })));

  const mode = options.execute ? '削除実行' : 'Dry Run（削除しません）';
  console.log(`${mode}: ${candidates.length}件のPreviewデプロイが対象です。`);
  for (const deployment of candidates) {
    console.log(`[${deployment.projectId}] ${formatDeployment(deployment)}`);
  }

  if (!options.execute || candidates.length === 0) {
    return;
  }

  for (const deployment of candidates) {
    await deleteDeployment({ deployment, teamId, token });
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  getDeploymentCreatedAt,
  isPreviewDeployment,
  parseArguments,
  shouldDeleteDeployment,
};
