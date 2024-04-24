export type TagFrom = string
export type TagTo = string

export interface CliOptions {
  from: TagFrom
  to: TagTo
  output: string
  domain: string
}

export interface Commit {
  hash: string
  author: string
  email: string
  date: string
  subject: string
}
