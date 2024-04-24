export type TagFrom = string
export type TagTo = string

export interface Commit {
  hash: string
  author: string
  email: string
  date: string
  subject: string
}
