type TagFrom = string;
type TagTo = string;
interface CliOptions {
    from: TagFrom;
    to: TagTo;
    output: string;
    domain: string;
}
interface Commit {
    hash: string;
    author: string;
    email: string;
    date: string;
    subject: string;
}

declare const packageName: string;
declare const parseLog: (message: string) => string;
declare const failedWithLog: (message: string, ...param: any) => never;
declare const finishedWithLog: (message: string, ...param: any) => never;

/**
 *
 * @param cmd 命令
 * @param args 参数
 * @returns stdout.trim()
 */
declare const execute: (cmd: string, args: string[]) => Promise<string>;

declare const getTags: () => Promise<string[]>;
declare const getLatestTag: () => Promise<string>;
declare const getPreviousTag: () => Promise<string>;
declare const getLatestTwoTags: () => Promise<{
    previous: string;
    latest: string;
}>;
declare const getDetailedCommitsBetweenTags: (tagFrom: TagFrom, tagTo: TagTo) => Promise<Commit[]>;
declare const getCommitHashesBetweenTags: (tagFrom: TagFrom, tagTo: TagTo) => Promise<string>;

export { type CliOptions, type Commit, type TagFrom, type TagTo, execute, failedWithLog, finishedWithLog, getCommitHashesBetweenTags, getDetailedCommitsBetweenTags, getLatestTag, getLatestTwoTags, getPreviousTag, getTags, packageName, parseLog };
