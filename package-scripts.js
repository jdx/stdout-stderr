const {
  setColors,
  concurrent,
  crossEnv,
  mkdirp,
  series,
} = require('nps-utils')

setColors(['dim'])

const script = (script, description) => description ? {script, description} : {script}

const linters = {
  tsc: script('tsc -p test --noEmit', 'syntax check with tsc'),
  eslint: script('eslint --ext ts src test', 'lint ts files'),
}

let mocha = 'mocha --forbid-only "test/**/*.test.ts"'
if (process.env.CI) {
  if (process.env.CIRCLECI) {
    // add mocha junit reporter
    mocha = crossEnv(`MOCHA_FILE=reports/mocha.xml ${mocha} --reporter mocha-junit-reporter`)
  }
  // add code coverage reporting with nyc
  const nyc = 'nyc --nycrc-path node_modules/@dxcli/nyc-config/.nycrc'
  const nycReport = `${nyc} report --reporter text-lcov > coverage.lcov`
  mocha = series(`${nyc} ${mocha}`, nycReport)
}

let test = concurrent({
  ...linters,
  test: series('nps build', mocha),
})

if (process.env.CI) test = series(mkdirp('reports'), test)

module.exports = {
  scripts: {
    ...linters,
    build: series('rm -rf lib', 'tsc'),
    lint: concurrent(linters),
    test,
    mocha,
  },
}
