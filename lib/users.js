import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { dir } from './home.js'

const file = path.join(dir, 'users.json')


export function add({ name, password }){
	let users = read()
		.filter(user => user.name !== name)

	users.push({
		name,
		password: hash(password)
	})

	write({ users })
}

export function remove({ name }){
	let users = read()
		.filter(user => user.name !== name)

	write({ users })
}

export function check({ name, password }){
	let user = read()
		.find(user => user.name === name)

	if(!user)
		return false

	return user.password === hash(password)
}

function hash(password){
	return crypto
		.createHash('sha256')
		.update(password, 'utf-8')
		.digest('base64')
}

function read(){
	return fs.existsSync(file)
		? JSON.parse(fs.readFileSync(file, 'utf-8'))
		: []
}

function write({ users }){
	fs.writeFileSync(file, JSON.stringify(users, null, 4))

	console.log(`wrote userlist to ${file}`)
}