const {
  concurrent,
  crossEnv,
  mkdirp,
  series,
  ifWindows,
  ifNotWindows,
} = require('nps-utils')
const pjson = require('./package.json')
const release = pjson.devDependencies.typedoc ? ['ci.release.semantic-release', 'ci.release.typedoc'] : ['ci.release.semantic-release']
const script = (script, description) => description ? {script, description} : {script}
const hidden = script => ({script, hiddenFromHelp: true})
const unixOrWindows = (unix, windows) => series(ifNotWindows(unix), ifWindows(windows))

let ciTests = [
  'ci.eslint',
  'ci.mocha',
  'ci.tslint',
]

module.exports = {
  scripts: {
    build: 'rm -rf lib && tsc',
    lint: {
      default: concurrent.nps('lint.eslint', 'lint.commitlint', 'lint.tsc', 'lint.tslint'),
      eslint: script('eslint .', 'lint js files'),
      commitlint: script('commitlint --from origin/master', 'ensure that commits are in valid conventional-changelog format'),
      tsc: script('tsc -p test --noEmit', 'syntax check with tsc'),
      tslint: script('tslint -p test', 'lint ts files'),
    },
    test: {
      default: script(concurrent.nps('lint', 'test.mocha'), 'lint and run all tests'),
      series: script(series.nps('lint', 'test.mocha'), 'lint and run all tests in series'),
      mocha: {
        default: script('mocha --forbid-only "test/**/*.test.ts"', 'run all mocha tests'),
        coverage: hidden(series.nps('test.mocha.nyc nps test.mocha')),
        junit: hidden(series(
          mkdirp('reports'),
          crossEnv('MOCHA_FILE="reports/mocha.xml" ') + series.nps('test.mocha.coverage --reporter mocha-junit-reporter'),
          series.nps('ci.mocha.nyc report --reporter text-lcov > coverage.lcov'),
        )),
        nyc: hidden('nyc --nycrc-path node_modules/@dxcli/dev-nyc-config/.nycrc'),
      },
    },
    ci: {
      test: {
        default: hidden(unixOrWindows(
          series.nps(...ciTests),
          concurrent.nps(...ciTests),
        )),
        eslint: hidden(
          unixOrWindows(
            series.nps('lint.eslint --format junit --output-file reports/eslint.xml'),
            series.nps('lint.eslint'),
          )
        ),
        mocha: hidden(
          unixOrWindows(
            series.nps('test.mocha.junit'),
            series.nps('test.mocha'),
          )
        ),
      },
      tslint: hidden(
        unixOrWindows(
          series.nps('test.tslint --format junit > reports/tslint.xml'),
          series.nps('test.tslint'),
        )
      ),
      release: {
        default: hidden(series.nps(...release)),
        'semantic-release': hidden('semantic-release -e @dxcli/dev-semantic-release'),
        typedoc: hidden(series(
          'git clone -b gh-pages $CIRCLE_REPOSITORY_URL gh-pages',
          'typedoc --out /tmp/docs src/index.ts --excludeNotExported --mode file',
          'rm -rf ./gh-pages/*',
          'mv /tmp/docs/* ./gh-pages',
          'cd gh-pages && git add . && git commit -m "updates from $CIRCLE_SHA1 [skip ci]" && git push',
        )),
      },
    },
  },
}
