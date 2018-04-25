const { init: appRepl, defaultWelcome } = require('./index')
const chalk = require('chalk')
const { promisify } = require('util')

const name = 'sample-app-repl'

const locals = {
  hello: () => 'Hello, world',
  asyncFail: () => promisify(setTimeout)(5000).then(() => Promise.reject(new Error('Nope, even 3 seconds later'))),
  asyncHello: () => promisify(setTimeout)(5000).then(() => 'Hello, world (5 seconds later)'),
}

const welcome = defaultWelcome({ name, locals })
  + chalk`{bold.cyan This is the sample app-repl: call the functions available locally to test it}`

appRepl({ name, locals, welcome })
