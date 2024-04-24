import { execute } from './command'
import { TagFrom, TagTo } from './types'

export const getGitTags = async (from?: TagFrom, to?: TagTo) => {
  if (from && to) return { previous: from, latest: to }
  const tags = await execute('git', [
    '--no-pager',
    'tag',
    '-l',
    '--sort=-creatordate'
  ])
  const previous = tags.split('\n')[1]
  const latest = tags.split('\n')[0]
  return { previous, latest }
}

export const getCommitsBetweenTags = (tagFrom: TagFrom, tagTo: TagTo) => {}
