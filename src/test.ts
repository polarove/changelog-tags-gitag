import { log } from 'console'
import { readFile } from 'fs'

const d = await import('../package.json')
log(d.version)
