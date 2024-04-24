import {
  getTags,
  getLatestTag,
  getPreviousTag,
  getLatestTwoTags,
  getDetailedCommitsBetweenTags,
  getCommitHashesBetweenTags
} from '../src'
import { test } from 'vitest'

test('获取所有tag', async () => {
  const tags = await getTags()
  console.log(tags)
})

test('获取最新的tag', async () => {
  const tags = await getLatestTag()
  console.log(tags)
})

test('获取前一个tag', async () => {
  const tags = await getPreviousTag()
  console.log(tags)
})

test('获取最新的两个tag', async () => {
  const tags = await getLatestTwoTags()
  console.log(tags)
})

test('获取两个tag间经过格式化的详细信息', async () => {
  const { previous, latest } = await getLatestTwoTags()
  const commits = await getDetailedCommitsBetweenTags(previous, latest)
  console.log(commits)
})

test('获取两个tag间的所有 commit hashes', async () => {
  const { previous, latest } = await getLatestTwoTags()
  const hashes = await getCommitHashesBetweenTags(previous, latest)
  console.log(hashes)
})
