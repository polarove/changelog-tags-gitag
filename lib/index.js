"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const console_1 = require("console");
const fs_1 = require("fs");
const process_1 = require("process");
const REPO_URL = 'https://github.com/gtesim/gt-admin';
const print = (msg) => (0, console_1.log)(`[更新日志生成器]：${msg}`);
(0, child_process_1.exec)("git for-each-ref refs/tags --sort=-taggerdate --format='%(refname:short)' --count=2", (error, stdout, stderr) => {
    if (error) {
        print('⚠️ 获取最新的两个 tag 时发生错误');
        (0, process_1.exit)(1);
    }
    if (stderr) {
        print(stderr);
        (0, process_1.exit)(2);
    }
    if (stdout) {
        const versions = stdout.replace(/'/g, '').split('\n');
        generate({ latest: versions[0], previous: versions[1] });
    }
});
const generate = (version) => {
    const command = `git log --pretty=format:"**%ci**%n%s by [%cn](%ce)%n详情：[\`%h\`](${REPO_URL}/commit/%H)%n" --no-merges ${version.previous}...${version.latest}`;
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error) {
            print('⚠️ git log 错误');
            process.exit(1);
        }
        if (stderr) {
            print(stderr);
            process.exit(2);
        }
        if (stdout) {
            const previousChangelog = getPreviousChangelog();
            if (previousChangelog.split('\n')[0].slice(3) !== version.latest) {
                stdout = `## ${version.latest}`
                    .concat('\n')
                    .concat(parse(stdout))
                    .concat('\n\n\n\n\n')
                    .concat(previousChangelog);
                (0, fs_1.writeFile)('./CHANGELOG.md', stdout, (err) => {
                    if (err)
                        print('⚠️ 生成时发生错误');
                    else
                        print(`😄 生成完毕`);
                });
            }
            else
                return print(`🧐 版本尚未更新，跳过本次生成`);
        }
    });
    const parse = (stdout) => {
        let stdoutArr = stdout.split('\n');
        return stdoutArr
            .splice(stdoutArr.indexOf('') + 1, stdoutArr.length)
            .reduce((a, b) => a + '\n' + b + '\n');
    };
    const getPreviousChangelog = () => {
        if ((0, fs_1.existsSync)('./CHANGELOG.md'))
            return (0, fs_1.readFileSync)('./CHANGELOG.md', { encoding: 'utf-8' });
        else
            return '';
    };
};
