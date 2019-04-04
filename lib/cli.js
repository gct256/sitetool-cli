const fs = require('fs')
const path = require('path')
const util = require('util')
const args = require('args')

const log = require('./log')
const setLogger = require('./setLogger')
const pkg = require('../package.json')

async function init () {
  log('sitetool loading ...')
  const sitetool = require('@gct256/sitetool')
  log('sitetool loaded.')

  const root = path.resolve('.')
  const configPath = path.resolve(root, 'sitetool.config.js')
  if (fs.existsSync(configPath)) {
    log(new Error(`config file already exitst: ${configPath}`))
    return
  }

  const config = sitetool.getDefaultConfig(root)
  config.directory.src = path.relative(root, config.directory.src)
  config.directory.work = path.relative(root, config.directory.work)
  config.directory.dist = path.relative(root, config.directory.dist)

  const content = `module.exports = ${util.inspect(config, {
    depth: Infinity,
    compact: false
  })}
`

  fs.writeFileSync(configPath, content)

  log(`create: ${configPath}`)
}

async function getRuntime ({ config }) {
  log('sitetool loading ...')
  const sitetool = require('@gct256/sitetool')
  log('sitetool loaded.')

  const runtime = new sitetool.Runtime()
  setLogger(runtime)
  await runtime.openConfigFile(config)

  return runtime
}

function cli () {
  args
    .option('config', 'Configuration file', './sitetool.config.js')
    .command(
      'init',
      'Create `sitetool.config.js` to current directory',
      async () => init()
    )
    .command(
      'clean',
      'Clean work and distribute directory',
      async (name, sub, options) => (await getRuntime(options)).clean()
    )
    .command(
      'start',
      'Run build, watch + serve',
      async (name, sub, options) => {
        const runtime = await getRuntime(options)
        await runtime.build()
        await runtime.startWatcher()
        runtime.startServer()
      }
    )
    .command(
      'watch',
      'Start watcher with src directory',
      async (name, sub, options) => (await getRuntime(options)).startWatcher()
    )
    .command(
      'serve',
      'Start local web server with work directory',
      async (name, sub, options) => (await getRuntime(options)).startServer()
    )
    .command('build', 'Build to work directory', async (name, sub, options) =>
      (await getRuntime(options)).build()
    )
    .command(
      'distribute',
      'Build to dist directory',
      async (name, sub, options) => (await getRuntime(options)).distribute()
    )

  Object.assign(args.config, {
    name: pkg.productName,
    version: pkg.version
  })

  args.parse(process.argv)

  // if (!Array.isArray(args.sub) || args.sub.length <= 0) args.showHelp()
}

module.exports = cli
