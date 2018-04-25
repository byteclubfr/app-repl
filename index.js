'use strict'

const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const home = require('user-home')
const Path = require('path')
const Repl = require('repl')

const mandatory = name => {
  throw new Error(`Missing option "${name}"`)
}

const defaultWelcome = ({ name = mandatory('name'), locals = {} }) => chalk`{dim

Welcome to {bold ${name}}’s REPL.

- Async operations hold the output until result
- Result of previous command (sync or async) is stored in {italic _}
- Global Node.js modules are available, {italic fs} is actually {italic fs-extra}
${locals && Object.keys(locals).length > 0 ? `- Additional variables: ${Object.keys(locals).join(', ')}
` : ''}
}`

const defaultHistoryFileName = ({ name = mandatory('name') }) =>
  `.${name}_repl_history`

const init = ({
  name,
  historyFileName = defaultHistoryFileName({ name }),
  historyFileDir = home,
  historyFilePath = historyFileName && Path.join(historyFileDir, historyFileName),
  historySize = 20,
  locals = {},
  welcome = defaultWelcome({ name, locals }),
  stdout = process.stdout,
  promptPrefix = ((x = mandatory('name')) => x)(name),
  promptSuffix = '❯',
  prompt = chalk`{dim ${promptPrefix}}{dim.bold ${promptSuffix}} `,
  replOptions = {},
} = {}) => {
  if (!replOptions.prompt) {
    replOptions.prompt = prompt
  }

  const replLocals = Object.assign({ fs }, locals)

  stdout.write(welcome + '\n')

  const repl = Repl.start(replOptions)
  repl.eval = asyncEval(repl.eval)

  if (historyFilePath && historySize > 0) {
    if (fs.existsSync(historyFilePath)) {
      readHistory(repl, historyFilePath)
    }
    repl.on('exit', () => saveHistory(repl, historyFilePath, historySize))
  }

  Object.assign(repl.context, replLocals)

  return repl
}

const asyncEval = _eval => (cmd, context, fileName, cb) =>
  _eval(cmd, context, fileName, (err, value) => {
    if (err) {
      return cb(err)
    }
    if (value && typeof value.then === 'function') {
      const spinner = ora(chalk.dim('Pending async operation…')).start()
      value.then(
        v => {
          spinner.succeed(chalk.dim('Value available as _'))
          cb(undefined, v)
        },
        err => {
          spinner.fail(chalk.dim('Operation failed'))
          cb(err)
        },
      )
    } else {
      cb(err, value)
    }
  })

const readHistory = (repl, historyFile) =>
  fs
    .readFileSync(historyFile, 'utf-8')
    .split('\n')
    .reverse()
    .filter(line => line.trim())
    .forEach(line => repl.history.push(line))

const saveHistory = (repl, historyFile, historySize) =>
  fs.writeFileSync(
    historyFile,
    repl.history
      .slice()
      .reverse()
      .slice(-historySize)
      .map(line => line.trim())
      .filter(line => line)
      .join('\n'),
  )

// Exposed API
module.exports = init
Object.assign(module.exports, {
  init,
  // Expose defaults to allow re-using them
  defaultWelcome,
  defaultHistoryFileName,
})
