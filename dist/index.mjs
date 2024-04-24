import { exit } from 'process';

const name = "changelog-tags";

let enabled = true;
// Support both browser and node environments
const globalVar = typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
/**
 * Detect how much colors the current terminal supports
 */
let supportLevel = 0 /* none */;
if (globalVar.process && globalVar.process.env && globalVar.process.stdout) {
    const { FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, COLORTERM } = globalVar.process.env;
    if (NODE_DISABLE_COLORS || NO_COLOR || FORCE_COLOR === '0') {
        enabled = false;
    }
    else if (FORCE_COLOR === '1' ||
        FORCE_COLOR === '2' ||
        FORCE_COLOR === '3') {
        enabled = true;
    }
    else if (TERM === 'dumb') {
        enabled = false;
    }
    else if ('CI' in globalVar.process.env &&
        [
            'TRAVIS',
            'CIRCLECI',
            'APPVEYOR',
            'GITLAB_CI',
            'GITHUB_ACTIONS',
            'BUILDKITE',
            'DRONE',
        ].some(vendor => vendor in globalVar.process.env)) {
        enabled = true;
    }
    else {
        enabled = process.stdout.isTTY;
    }
    if (enabled) {
        // Windows supports 24bit True Colors since Windows 10 revision #14931,
        // see https://devblogs.microsoft.com/commandline/24-bit-color-in-the-windows-console/
        if (process.platform === 'win32') {
            supportLevel = 3 /* trueColor */;
        }
        else {
            if (COLORTERM && (COLORTERM === 'truecolor' || COLORTERM === '24bit')) {
                supportLevel = 3 /* trueColor */;
            }
            else if (TERM && (TERM.endsWith('-256color') || TERM.endsWith('256'))) {
                supportLevel = 2 /* ansi256 */;
            }
            else {
                supportLevel = 1 /* ansi */;
            }
        }
    }
}
let options = {
    enabled,
    supportLevel,
};
function kolorist(start, end, level = 1 /* ansi */) {
    const open = `\x1b[${start}m`;
    const close = `\x1b[${end}m`;
    const regex = new RegExp(`\\x1b\\[${end}m`, 'g');
    return (str) => {
        return options.enabled && options.supportLevel >= level
            ? open + ('' + str).replace(regex, open) + close
            : '' + str;
    };
}
const red = kolorist(31, 39);
const green = kolorist(32, 39);

const packageName = name;
const parseLog = (message) => {
  return `[${packageName}]\uFF1A`.concat(message);
};
const failedWithLog = (message, ...param) => {
  console.error(parseLog("\u2757 ".concat(red(message))), param);
  return exit(1);
};
const finishedWithLog = (message, ...param) => {
  console.error(parseLog("\u2728 ".concat(green(message))), param);
  return exit(0);
};

const execute = async (cmd, args) => {
  const { execa } = await import('execa');
  const res = await execa(cmd, args);
  return res.stdout.trim();
};

const getTags = async () => {
  return await execute("git", [
    "--no-pager",
    "tag",
    "-l",
    "--sort=-creatordate"
  ]).then((tags) => {
    const result = tags.trim().split("\n");
    if (result.length > 0)
      return Promise.resolve(result);
    else
      return Promise.reject("tag\u4E3A\u7A7A");
  }).catch(
    (err) => failedWithLog(err, " | git --no-pager tag -l --sort=-creatordate")
  );
};
const getLatestTag = async () => {
  return await getTags().then((tags) => tags[0]).catch((err) => failedWithLog(err, " | getTags"));
};
const getPreviousTag = async () => {
  return await getTags().then((tags) => tags[1]).catch((err) => failedWithLog(err, " | getTags"));
};
const getLatestTwoTags = async () => {
  return await getTags().then((tags) => {
    return { previous: tags[1], latest: tags[0] };
  }).catch((err) => failedWithLog(err, " | getTags"));
};
const getDetailedCommitsBetweenTags = async (tagFrom, tagTo) => {
  const commits = await execute("git", [
    "log",
    '--pretty=format:{"hash": "%H", "author": "%cn", "email": "%ce", "date": "%ai", "subject": "%s"},',
    `${tagFrom}..${tagTo}`
  ]);
  return JSON.parse("[".concat(commits).slice(0, commits.length).concat("]"));
};
const getCommitHashesBetweenTags = async (tagFrom, tagTo) => {
  return await execute("git", [
    "log",
    "--pretty=oneline",
    `${tagFrom}...${tagTo}`
  ]);
};

export { execute, failedWithLog, finishedWithLog, getCommitHashesBetweenTags, getDetailedCommitsBetweenTags, getLatestTag, getLatestTwoTags, getPreviousTag, getTags, packageName, parseLog };
