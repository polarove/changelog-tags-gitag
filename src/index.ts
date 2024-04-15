import { exec } from 'child_process'
import { log } from 'console'
import { existsSync, readFileSync, writeFile } from 'fs'
import { exit } from 'process'

interface Tags {
	latest: string | undefined
	previous: string | undefined
}

const getRepoUrl = () => {
	let url
	process.argv.forEach((value, index) => {
		if (value === '--repo') {
			url = process.argv[index + 1]
		}
	})
	return url
}

const print = (msg: string) => log(`[更新日志生成器]：${msg}`)

exec(
	"git for-each-ref refs/tags --sort=-taggerdate --format='%(refname:short)' --count=2",
	(error, stdout, stderr) => {
		if (error) {
			print('⚠️ 获取最新的两个 tag 时发生错误')
			exit(1)
		}

		if (stderr) {
			print(stderr)
			exit(2)
		}

		if (stdout) {
			const versions = stdout.replace(/'/g, '').split('\n')
			generate({ latest: versions![0], previous: versions![1] })
		}
	}
)

const generate = (version: Tags) => {
	const repoUrl = getRepoUrl()
	if (!repoUrl) {
		print('⚠️ 请指定仓库地址')
		print('ct --repo https://yourgit.com/xxx/xxx')
		exit(1)
	}
	const command = `git log --pretty=format:"**%ci**%n%s by [%cn](%ce)%n详情：[\`%h\`](${repoUrl}/commit/%H)%n" --no-merges ${version.previous}...${version.latest}`
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
}
