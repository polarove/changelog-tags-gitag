import { exit } from 'process'
import { name } from '../package-lock.json'
import { red } from 'kolorist'

export const packageName = name

export const parseLog = (message: string) => {
  return `[${packageName}]：`.concat(message)
}

export const failedWithLog = (message: string, ...param: any) => {
  console.error(parseLog('❗ '.concat(red(message))), param)
  return exit(1)
}
