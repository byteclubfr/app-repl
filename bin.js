const appRepl = require('./index')

let modulePath = process.argv[2]
if (modulePath === '--help' || modulePath === '-h') {
  process.stdout.write(`
Usage: app-repl [module-path] [name]

Starts an app-repl with "module-path" required and set as additional locals

- if module-path is unset or empty, no additional locals will be injected
- if name is unset or empty, your package.json will be used
`)
  process.exit(0)
}

// default name = local package.json's name
const name = process.argv[3] || require(require('pkg-up').sync()).name

let locals = {}
if (modulePath) {
  // Note that './' prefix is mandatory for local modules
  locals.api = require(modulePath)
}

appRepl({ name, locals })
