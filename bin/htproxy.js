#!/usr/bin/env node

import parseArgs from 'minimist'
import runServer from '../lib/server.js'
import { createInterface } from 'readline'
import { stdin as input, stdout as output } from 'process'
import * as users from '../lib/users.js'


const args = parseArgs(process.argv.slice(2))
const rl = createInterface({ input, output })



switch(args._[0]){
	case 'adduser': {
		let name = args._[1]

		if(!name){
			console.log(`please specify a username: htproxy adduser [username]`)
			process.exit()
		}

		users.add({
			name,
			password: await new Promise(resolve => {
				rl.question(`enter password for "${name}": `, resolve)
			})
		})
		break
	}

	case 'deluser': {
		let name = args._[1]

		if(!name){
			console.log(`please specify a username: htproxy deluser [username]`)
			process.exit()
		}

		users.remove({
			name
		})
		break
	}

	default: {
		let ssl
		
		if(!args.port){
			console.log(`please specify a port using --port`)
			process.exit()
		}

		if(args['ssl-key']){
			ssl = {
				key: args['ssl-key'],
				cert: args['ssl-cert']
			}
		}

		await runServer({
			port: parseInt(args.port),
			ssl
		})
		break
	}
}

process.exit()