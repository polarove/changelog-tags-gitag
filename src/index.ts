import { exec, execSync } from 'child_process'
import { log } from 'console'
import { existsSync, readFileSync, writeFile } from 'fs'
import { exit } from 'process'

interface Tags {
  latest: string | undefined
  previous: string | undefined
}

const print = (msg: string) => log(`[更新日志生成器]：${msg}`)

const launch = () => {
  const tags = execSync('git tag --list')
  if (tags.length <= 0) {
    print('未找到tags')
    exit(0)
  } else fetchTags()
}
launch()

const fetchTags = () => {
  exec(
    "git for-each-ref refs/tags --sort=-taggerdate --format='%(refname:short)' --count=2",
    (error, stdout, stderr) => {
      if (error) {
        console.log('err')
        print('⚠️ 获取最新的两个 tag 时发生错误')
        exit(1)
      } else if (stderr) {
        print(stderr)
        console.log('err')
        exit(2)
      } else if (stdout) {
        console.log('err')
        const versions = stdout.replace(/'/g, '').trim().split('\n')
        generate({ latest: versions![0], previous: versions![1] })
      } else {
        print('未找到tags')
        exit(0)
      }
    }
  )
}

const generate = (version: Tags) => {
  let url
  process.argv.forEach((value, index) => {
    if (value === '--repo') {
      url = process.argv[index + 1]
    }
  })
  console.log(url)
  if (url) {
    const command = `git log --pretty=format:"**%ci**%n%s by [%cn](%ce)%n详情：[\`%h\`](${url}/commit/%H)%n" --no-merges ${version.previous}...${version.latest}`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        print('⚠️ git log 错误')
        process.exit(1)
      }

      if (stderr) {
        print(stderr)
        process.exit(2)
      }

      if (stdout) {
        const previousChangelog = getPreviousChangelog()
        if (previousChangelog.split('\n')[0].slice(3) !== version.latest) {
          stdout = `## ${version.latest}`
            .concat('\n')
            .concat(parse(stdout))
            .concat('\n\n\n\n\n')
            .concat(previousChangelog)
          writeFile('./CHANGELOG.md', stdout, (err) => {
            if (err) print('⚠️ 生成时发生错误')
            else print(`😄 生成完毕`)
          })
        } else return print(`🧐 版本尚未更新，跳过本次生成`)
      }
    })

    const parse = (stdout: string): string => {
      let stdoutArr = stdout.split('\n')
      return stdoutArr
        .splice(stdoutArr.indexOf('') + 1, stdoutArr.length)
        .reduce((a, b) => a + '\n' + b + '\n')
    }
    const getPreviousChangelog = () => {
      if (existsSync('./CHANGELOG.md'))
        return readFileSync('./CHANGELOG.md', { encoding: 'utf-8' })
      else return ''
    }
    exit(0)
  } else {
    print('⚠️ 未指定仓库的url')
    print('ct --repo https://yourgit.com/xxx/xxx')
    exit(1)
  }
}
