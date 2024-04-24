import { exit } from 'process'
import { name } from '../package-lock.json'
import { red } from 'kolorist'

export const packageName = name

export const parseLog = (message: string) => {
  return `[${packageName}]：`.concat(message)
}

export const failedWithLog = (message: string) => {
  console.error(parseLog('❗ '.concat(red(message))))
  return exit(1)
}

export const finishedWithLog = (message: string) => {
  console.error(parseLog('✨ '.concat(red(message))))
  return exit(0)
}
