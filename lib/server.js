import fs from 'fs'
import http from 'http'
import https from 'https'
import httpProxy from 'http-proxy'
import * as users from './users.js'


export default async function run({ port, ssl }){
	let proxy = httpProxy.createProxyServer()
	let server

	if(ssl){
		server = https.createServer(
			{
				key: fs.readFileSync(ssl.key, 'utf-8'),
				cert: fs.readFileSync(ssl.cert, 'utf-8'),
			},
			handle.bind(null, proxy)
		)
	}else{
		server = http.createServer(
			handle.bind(null, proxy)
		)
	}

	server.on('upgrade', (req, socket, head) => {
		console.log(`  -> upgrading to websocket`)
		proxy.ws(req, socket, head)
	})

	console.log(`listening on port ${port}`)
	server.listen(port)

	await new Promise(resolve => server.on('close', resolve))
}

function handle(proxy, req, res){
	console.log(`new connection from`, req.connection.remoteAddress)

	let auth = req.headers['proxy-authorization'] || req.headers['authorization']
	let destination = req.headers['proxy-destination'] || `https://${req.headers['host']}`

	try{
		var user = authenticateUser(auth)
	}catch(reason){
		console.log(`  -> ${reason}`)

		res.writeHead(403)
		res.end()
		return
	}

	console.log(`  -> auth passed [${user}]`)
	console.log(`  -> proxying to ${destination}`)

	proxy.web(
		req, 
		res, 
		{
			target: destination,
			secure: destination.startsWith('https')
		},
		error => console.log(`  -> failed to serve: ${error.message}`)
	)
}

function authenticateUser(auth){
	if(!auth){
		throw `rejected because auth header not set`
	}

	let [authMethod, authCredentials] = auth.split(' ')

	if(authMethod !== 'Basic'){
		throw `rejected because auth method is not supported (${authMethod})`
	}

	let [user, password] = Buffer.from(authCredentials, 'base64')
		.toString('utf-8')
		.split(':')

	if(!users.check({ name: user, password }))
		throw `incorrect credentials (${user})`

	return user
}