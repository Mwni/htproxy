import fs from 'fs'
import os from 'os'
import path from 'path'

export const dir = path.join(os.homedir(), '.htproxy')

if(!fs.existsSync(dir)){
	fs.mkdirSync(dir)
}