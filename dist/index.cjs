'use strict';

const child_process = require('child_process');
const console$1 = require('console');
const fs = require('fs');
const process$1 = require('process');

const print = (msg) => console$1.log(`[\u66F4\u65B0\u65E5\u5FD7\u751F\u6210\u5668]\uFF1A${msg}`);
const launch = () => {
  const tags = child_process.execSync("git tag --list");
  if (tags.length <= 0) {
    print("\u672A\u627E\u5230tags");
    process$1.exit(0);
  } else
    fetchTags();
};
launch();
const fetchTags = () => {
  child_process.exec(
    "git for-each-ref refs/tags --sort=-taggerdate --format='%(refname:short)' --count=2",
    (error, stdout, stderr) => {
      if (error) {
        console.log("err");
        print("\u26A0\uFE0F \u83B7\u53D6\u6700\u65B0\u7684\u4E24\u4E2A tag \u65F6\u53D1\u751F\u9519\u8BEF");
        process$1.exit(1);
      } else if (stderr) {
        print(stderr);
        console.log("err");
        process$1.exit(2);
      } else if (stdout) {
        console.log("err");
        const versions = stdout.replace(/'/g, "").trim().split("\n");
        generate({ latest: versions[0], previous: versions[1] });
      } else {
        print("\u672A\u627E\u5230tags");
        process$1.exit(0);
      }
    }
  );
};
const generate = (version) => {
  const url = child_process.execSync("git config --get remote.origin.url", {
    encoding: "utf-8"
  });
  const command = `git log --pretty=format:"**%ci**%n%s by [%cn](%ce)%n\u8BE6\u60C5\uFF1A[\`%h\`](${url.replace("git@", "https://").replace(".git", ".com")}/commit/%H)%n" --no-merges ${version.previous}...${version.latest}`;
  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      print("\u26A0\uFE0F git log \u9519\u8BEF");
      process.exit(1);
    }
    if (stderr) {
      print(stderr);
      process.exit(2);
    }
    if (stdout) {
      const previousChangelog = getPreviousChangelog();
      if (previousChangelog.split("\n")[0].slice(3) !== version.latest) {
        stdout = `## ${version.latest}`.concat("\n").concat(parse(stdout)).concat("\n\n\n\n\n").concat(previousChangelog);
        fs.writeFile("./CHANGELOG.md", stdout, (err) => {
          if (err)
            print("\u26A0\uFE0F \u751F\u6210\u65F6\u53D1\u751F\u9519\u8BEF");
          else
            print(`\u{1F604} \u751F\u6210\u5B8C\u6BD5`);
        });
      } else
        return print(`\u{1F9D0} \u7248\u672C\u5C1A\u672A\u66F4\u65B0\uFF0C\u8DF3\u8FC7\u672C\u6B21\u751F\u6210`);
    }
  });
  const parse = (stdout) => {
    let stdoutArr = stdout.split("\n");
    return stdoutArr.splice(stdoutArr.indexOf("") + 1, stdoutArr.length).reduce((a, b) => a + "\n" + b + "\n");
  };
  const getPreviousChangelog = () => {
    if (fs.existsSync("./CHANGELOG.md"))
      return fs.readFileSync("./CHANGELOG.md", { encoding: "utf-8" });
    else
      return "";
  };
  process$1.exit(0);
};
