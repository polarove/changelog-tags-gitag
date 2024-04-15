import { exec } from 'child_process'
import { writeFile } from 'fs'
import { exit } from 'process'

const command =
	'git log --pretty=format:"%ci%n%s by %ce%n详情：[`%h`](https://gitee.com/gtesim/gt-admin/commit/%H)%n" --no-merges v0.0.41...v0.0.42'

exec(command, (error, stdout, stderr) => {
	if (error) {
		console.log(error)
		exit(1)
	}

	if (stderr) {
		console.log(stderr)
		exit(2)
	}

	if (stdout) {
		writeFile('./CHANGELOG.md', stdout, (err) => {
			if (err) {
				console.error(`Error writing to`)
			} else {
				console.log(`Content successfully written to`)
			}
		})
	}
})
