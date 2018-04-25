# my-repl

You can use this small library as a quick-start to create a REPL for your application.

A dedicated REPL can be a very easy way to add an administration CLI to any project : you probably already have a model layer, just inject it in an async-capable REPL and you have your CLI CRUD all set!

[![asciicast](https://asciinema.org/a/uLWmp2jYETOJSLaEVRalZygBh.png)](https://asciinema.org/a/uLWmp2jYETOJSLaEVRalZygBh)

## Main features

* Easy to setup with smart defaults (just provide a name, a few locals, and you're ready)
* Highly configurable (see available options below)
* Async-friendly : when expression evaluates as a promise, the REPL will hold and wait for the result to be actually ready
* Comes with a bin `my-repl` to test it right away (see executable below)

## Samples

### Administration CLI: CRUD

Suppose you have your model layer in `lib/model` which exposes all your asynchronous methods to handle your data, you could add a CRUD CLI in your application with this code:

```js
require('my-repl')({
  name: 'my-app',
  locals: model,
})
```

Yep, that's it :)

Note that you may not even need to write a line of JavaScript as adding this to your ``package.json`` will have exactly the same effect:

```json
{
  "name": "my-app",
  "scripts": {
    "repl": "my-repl ./lib/model"
  }
}
```

### Just an async REPL with your own helpers…

… and customized welcome string, adding your own message. See `sample.js`:

```js
const { init: myRepl, defaultWelcome } = require('my-repl')
const chalk = require('chalk')
const { promisify } = require('util')

const myHelpers = {
  syncHello: () => 'Hello, world',
  asyncFail: () => promisify(setTimeout)(5000)
    .then(() => Promise.reject(new Error('Nope, even 3 seconds later'))),
  asyncHello: () => promisify(setTimeout)(5000)
    .then(() => 'Hello, world (5 seconds later)'),
}

const name = 'my-helpers'

const welcome = defaultWelcome({ name, locals })
  + chalk`{bold.cyan Play with my helpers!}`

myRepl({ name, locals, welcome })
```

### A very minimal async REPL

See `minimal.js`:

```js
// no welcome, no history, no prompt = no need for name
require('my-repl')({
  welcome: '',
  promptPrefix: '',
  historyFileName: '',
})
```

## `my-repl` executable

This module comes with an executable named `my-repl`.

**Usage**: `my-repl [module-path] [name]`

- if module-path is unset or empty, no additional locals will be injected, otherwise the provided module will be required and injected as local variable `api`
- if name is unset or empty, your package.json will be used

This allows to easily run a CRUD administration CLI without coding anything, or even just test a module you're working on:

```sh
# Start the admin CLI to manage data, typically you will add it to your package.json:
npm add --save-dev my-repl
my-repl ./lib/model

# Just run a one-shot my-repl just to play with a local module
npx my-repl ./lib/my/wip.js
```

## Available options

* **name** (string): the name of this REPL, used to generate history file name, welcome string, and prompt, so this option is mandatory if you did not define yourself each of those options
* **locals** (object): the variables made locally available in repl
* **historyFileName** (string): the base name of the history file, set to empty to disable history (default = `.${name}_repl_history`)
* historySize (number): number of commands max stored in history (default = 20)
* historyFileDir (string): the directory of the history file (default = user's home)
* historyFilePath (string): the full path of the history file (you may not use this option, default = joined historyFileDir and historyFileName)
* **welcome** (string): the welcome string, printed just before the initial prompt (default = some text showing your app's name and available locals)
* stdout (object): output stream (default = process.stdout)
* **promptPrefix** (string): the first part of the prompt (default = name)
* promptSuffix (string): usually a single character like `>` or `$` (default is nice unicode `❯` taken from `pure` zsh theme)
* prompt (string): the full prompt (default = built from promptPrefix and promptSuffix)
* replOptions (object): additional options passed to `repl.start()`

## Roadmap

* Enhance executable to be able to choose local's name and inject more than one module
* It would be nice to detect callback-async methods and wait for them too
* It would be nice to allow 'await', although it does not seem really useful as we already wait for promises resolution
