import { execute } from './command'
import { failedWithLog } from './log'
import { Commit, TagFrom, TagTo } from './types'

export const getTags = async (): Promise<string[]> => {
  return await execute('git', [
    '--no-pager',
    'tag',
    '-l',
    '--sort=-creatordate'
  ])
    .then((tags: string) => {
      const result = tags.trim().split('\n')
      if (result.length > 0) return Promise.resolve(result)
      else return Promise.reject('tag为空')
    })
    .catch((err: any) =>
      failedWithLog(err, ' | git --no-pager tag -l --sort=-creatordate')
    )
}

export const getLatestTag = async (): Promise<string> => {
  return await getTags()
    .then((tags) => tags[0])
    .catch((err) => failedWithLog(err, ' | getTags'))
}

export const getPreviousTag = async (): Promise<string> => {
  return await getTags()
    .then((tags) => tags[1])
    .catch((err) => failedWithLog(err, ' | getTags'))
}

export const getLatestTwoTags = async (): Promise<{
  previous: string
  latest: string
}> => {
  return await getTags()
    .then((tags) => {
      return { previous: tags[1], latest: tags[0] }
    })
    .catch((err) => failedWithLog(err, ' | getTags'))
}

export const getDetailedCommitsBetweenTags = async (
  tagFrom: TagFrom,
  tagTo: TagTo
): Promise<Commit[]> => {
  const commits = await execute('git', [
    'log',
    '--pretty=format:{"hash": "%H", "author": "%cn", "email": "%ce", "date": "%ai", "subject": "%s"},',
    `${tagFrom}..${tagTo}`
  ])
  return JSON.parse('['.concat(commits).slice(0, commits.length).concat(']'))
}

export const getCommitHashesBetweenTags = async (
  tagFrom: TagFrom,
  tagTo: TagTo
) => {
  return await execute('git', [
    'log',
    '--pretty=oneline',
    `${tagFrom}...${tagTo}`
  ])
}
