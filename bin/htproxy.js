#!/usr/bin/env node

import http from 'http'
import httpProxy from 'http-proxy'

if(process.argv.length !== 4){
	console.log(`please specify: [port] [password]`)
	process.exit()
}

const [port, password] = process.argv.slice(2)

const proxy = httpProxy.createProxyServer()
const server = http.createServer((req, res) => {
	let destination = req.headers['proxy-destination'] || `https://${req.headers.host}`
	let auth = req.headers['proxy-authorization']

	console.log(`new connection from`, req.connection.remoteAddress)

	if(!auth){
		console.log(`  -> rejected because auth header not set`)
		res.writeHead(403)
		res.end()
		return
	}

	let [authMethod, authCredentials] = auth.split(' ')

	if(authMethod !== 'passwd'){
		console.log(`  -> rejected because auth method is unsupported (${authMethod})`)
		res.writeHead(403)
		res.end()
		return
	}

	if(authCredentials !== password){
		console.log(`  -> rejected because password mismatch (${authCredentials} != ${password})`)
		res.writeHead(403)
		res.end()
		return
	}

	if(!destination){
		console.log(`  -> rejected because destination unclear)`)
		res.writeHead(400)
		res.end()
		return
	}

	console.log(`  -> auth passed`)
	console.log(`  -> proxying to ${destination}`)

	proxy.web(
		req, 
		res, {
			target: destination,
			secure: destination.startsWith('https')
		},
		error => console.log(`  -> failed to serve: ${error.message}`)
	)
})

server.on('upgrade', (req, socket, head) => {
	console.log(`upgrading ${req.connection.remoteAddress} to websocket`)
	proxy.ws(req, socket, head)
})

server.listen(parseInt(port))

console.log(`listening on port ${port}`)