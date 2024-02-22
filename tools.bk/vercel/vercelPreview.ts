/* eslint-disable @typescript-eslint/no-var-requires */
const { Octokit } = require('octokit');
const exec = require('@actions/exec');
const _ = require('lodash');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const repository = {
  owner: process.env.GITHUB_ORG,
  repo: process.env.GITHUB_REPO,
};

const pullRequest = {
  number: process.env.GITHUB_PR_NUMBER,
};

const vercelUsers = [
  'arslan2012', // arslan@getjerry.com
  'gedaaaa', // depeng@getjerry.com
  'weiwensangsang', // zhen@getjerry.com
  'zhangciwu', // changwei@getjerry.com
  'Stupidism', // feng@getjerry.com
  'zhounewz', // xinzhe.zhou@getjerry.com
  'gaofeiyang2022', // gaofei.yang@getjerry.com
  'EasonSoong', // yixian.song@getjerry.com
  'zhenxianchen', // zhenxian.chen@getjerry.com
  'mhan962464', // ronglong.deng@getjerry.com
  'stevenmichaelthomas', // sthomas@goodwatercap.com
  'leeyyl', // wallace@getjerry.com
];

/**
 * Vercel deploy
 * @param commitSha commit sha
 * @param isProd 是否是生产环境
 * @returns
 */
async function vercelDeploy(commitSha: string, isProd: boolean) {
  console.info('[vercelDeploy] start build commitSha: ', commitSha);

  await exec.exec('npx vercel build', ['-t', process.env.VERCEL_TOKEN], {
    listeners: {
      stdout: (data) => {
        console.info(data.toString());
      },
      stderr: (error) => {
        console.error(error.toString());
      },
    },
  });
  console.info('[vercelDeploy] start deploy');

  let myOutput = '';
  let myError = '';
  await exec.exec(
    'npx vercel deploy',
    [
      '--prebuilt',
      isProd ? '--prod' : '',
      '-t',
      process.env.VERCEL_TOKEN,
      '-m',
      `githubCommitSha=${commitSha}`,
      '-m',
      `githubCommitAuthorName=${process.env.GITHUB_COMMIT_AUTHOR_NAME}`,
      '-m',
      `githubCommitAuthorLogin=${process.env.GITHUB_COMMIT_AUTHOR_LOGIN}`,
      '-m',
      'githubDeployment=1',
      '-m',
      `githubOrg=${process.env.GITHUB_ORG}`,
      '-m',
      `githubRepo=${process.env.GITHUB_REPO}`,
      '-m',
      `githubCommitOrg=${process.env.GITHUB_COMMIT_ORG}`,
      '-m',
      `githubCommitRepo=${process.env.GITHUB_COMMIT_REPO}`,
      '-m',
      `githubCommitMessage=${process.env.GITHUB_COMMIT_MESSAGE}`,
      '-m',
      `githubCommitRef=${process.env.GITHUB_COMMIT_REF}`,
    ],
    {
      listeners: {
        stdout: (data) => {
          myOutput += data.toString();
        },
        stderr: (data) => {
          myError += data.toString();
        },
      },
    }
  );
  console.info('\n\n');
  console.info('[vercelDeploy] deploy succeed', myOutput);
  console.info('\n\n');

  if (myError) {
    console.error('[vercelDeploy] error', myError, '\n\n\n');
  }

  const deploymentUrlMatch = /https:\/\/.*-\w+-jerry-insur\.vercel\.app/.exec(myOutput);
  const inspectUrlMatch = /(https:\/\/vercel\.com\/jerry-insur\/[a-z0-9A-Z-]*\/\w+)/.exec(myError);

  return {
    deploymentUrl: deploymentUrlMatch?.[0] || '',
    inspectUrl: inspectUrlMatch?.[1] || '',
  };
}

/**
 * Find comments for event
 * @returns
 */
async function findCommentsForEvent() {
  console.info('find comments for event');

  return octokit.rest.issues.listComments({
    ...repository,
    issue_number: pullRequest.number,
  });
}

/**
 * Find previous comment
 * @param text start with
 * @returns
 */
async function findPreviousComment(text: string) {
  console.info('find comment');
  const { data: comments } = await findCommentsForEvent();

  const vercelPreviewURLComment = comments.find((comment) => comment.body.startsWith(text));
  if (vercelPreviewURLComment) {
    console.info('previous comment found');
    return vercelPreviewURLComment;
  }
  console.info('previous comment not found');
  return null;
}

interface VercelProject {
  name: string;
  inspectUrl?: string;
  deploymentUrl?: string;
  deployedAt?: Date;
}

/**
 * Build comment prefix
 * @returns
 */
function buildCommentPrefix() {
  return `**The latest updates on your projects**. Learn more about [Vercel for Git ↗︎](https://vercel.link/github-learn-more)`;
}

/**
 * Build comment body
 * @param projects vercel projects list
 * @returns
 */
function buildCommentBody(projects: VercelProject[]) {
  const prefix = `${buildCommentPrefix()}\n`;

  return `${prefix}

| Name | Status | Preview | Updated |
| :--- | :----- | :------ | :------ |
${projects
  .map(({ name, inspectUrl, deploymentUrl, deployedAt }) => {
    const isPending = !inspectUrl || !deploymentUrl;

    return [
      `**${name}**`,
      isPending ? 'Pending' : `✅ Ready ${inspectUrl ? `([Inspect](${inspectUrl}))` : ''}`,
      deploymentUrl && `[Visit Preview](${deploymentUrl})`,
      deployedAt?.toISOString(),
    ];
  })
  .map((cells: string[]) => {
    return '| ' + cells.join(' | ') + ' |';
  })
  .join('\n')}
`;
}

/**
 * Parse comment body
 * @param commentBody comment body string
 * @returns
 */
function parseCommentBody(commentBody: string) {
  if (!commentBody) return [];
  const regex = /\| \*\*(.*)\*\* \| (?:.*Ready|Pending)(?: \(\[Inspect\]\((https:\/\/[a-zA-Z0-9:/\-.]*)\)\))? \| (?:\[Visit Preview\]\((https:\/\/[a-z0-9:/\-.]*)\))? \| (.*) \|/g;

  let res = regex.exec(commentBody);

  const projects: VercelProject[] = [];

  while (res) {
    const [, name, inspectUrl, deploymentUrl, deployedAt] = res;

    if (name) {
      projects.push({
        name,
        inspectUrl,
        deploymentUrl,
        deployedAt: deployedAt ? new Date(deployedAt) : new Date(),
      });
    }

    res = regex.exec(commentBody);
  }

  return projects;
}

/**
 * Create comment on pull request
 * @param project vercel project
 */
async function createCommentOnPullRequest(project: VercelProject) {
  console.info('[createCommentOnPullRequest]: ', project);
  const comment = await findPreviousComment(buildCommentPrefix());
  console.info('[createCommentOnPullRequest]: old comment', comment?.body);

  const affectedProjectNames = _.intersection((process.env.VERCEL_AFFECTED_PROJECTS || '').split(','), [
    'ui-content',
    'signup-pages',
    'seo-pages',
    'seo-sections',
    'seo-components',
    'seo-utils',
    'jerry-ui',
  ]);
  const existingProjects = parseCommentBody(comment?.body);

  const projects: VercelProject[] = _.unionBy(
    _.unionBy([project], existingProjects, 'name'),
    affectedProjectNames.map((name) => ({ name })),
    'name'
  );

  console.info('[createCommentOnPullRequest]: projects', JSON.stringify(projects, null, 2));

  const commentBody = buildCommentBody(projects);
  console.info('[createCommentOnPullRequest]: new comment\n\n', commentBody, '\n\n');

  if (comment) {
    await octokit.rest.issues.updateComment({
      ...repository,
      comment_id: comment.id,
      body: commentBody,
    });
  } else {
    await octokit.rest.issues.createComment({
      ...repository,
      issue_number: pullRequest.number,
      body: commentBody,
    });
  }
}

/**
 * Create deployment
 * @param pullRequestRef pull request ref
 * @param deploymentName deployment name
 * @returns
 */
async function createDeployment(pullRequestRef, deploymentName) {
  const res = await octokit.request('post /repos/{owner}/{repo}/deployments', {
    ...repository,
    ref: pullRequestRef,
    required_contexts: [],
    environment: `Preview - ${deploymentName}`,
    auto_merge: false,
  });

  return res.data.id;
}

/**
 * Create deployment status
 * @param deployment_id deployment id
 * @param deploymentUrl deployment url
 * @param deploymentName deployment name
 */
async function createDeploymentStatus(deployment_id, deploymentUrl, deploymentName) {
  await octokit.request('post /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
    ...repository,
    deployment_id,
    state: 'success',
    log_url: deploymentUrl,
    description: 'preview',
    environment: `Preview - ${deploymentName}`,
    environment_url: deploymentUrl,
  });
}

/**
 * Vercel preview
 * @returns
 */
async function vercelPreview() {
  const author = process.env.GITHUB_COMMIT_AUTHOR_NAME || '';

  if (!vercelUsers.includes(author)) {
    console.info(
      `[vercelPreview] skipped because ${author} is not one of the configured vercel users in vercelPreview.ts`
    );
    return;
  }
  const commitSha = process.env.GITHUB_COMMIT_SHA || '';
  const deploymentName = process.env.VERCEL_PROJECT_NAME || '';
  const isProd = process.env.VERCEL_ENV === 'prod';
  console.info('[vercelPreview] start deploy: ');

  let deploymentUrl: string;
  let inspectUrl: string;

  if (!process.env.VERCEL_DEPLOYMENT_URL) {
    ({ deploymentUrl, inspectUrl } = await vercelDeploy(commitSha, isProd));
    console.info('[vercelPreview] deploymentUrl: ', deploymentUrl);
    console.info('[vercelPreview] inspectUrl: ', inspectUrl);
  } else {
    deploymentUrl = process.env.VERCEL_DEPLOYMENT_URL;
    inspectUrl = process.env.VERCEL_INSPECT_URL || '';
    console.info('[vercelPreview] skip deploy because environment variable VERCEL_DEPLOYMENT_URL provided ');
  }

  if (isProd) return;

  try {
    const commitRef = process.env.GITHUB_COMMIT_REF;

    const deploymentId = await createDeployment(commitRef, deploymentName);

    console.info('[vercelPreview] deploymentId: ', deploymentId);

    await createDeploymentStatus(deploymentId, deploymentUrl, deploymentName);
    console.info('[vercelPreview] deployment status created');

    await createCommentOnPullRequest({
      name: deploymentName,
      deploymentUrl,
      inspectUrl,
      deployedAt: new Date(),
    });
    console.info('[vercelPreview] comment updated');
  } catch (error) {
    console.error('error: ', error);
  }
}

void vercelPreview();
