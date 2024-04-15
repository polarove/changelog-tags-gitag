import { readFile } from 'fs'

readFile('../package.json', (err, data) => console.log(data))
