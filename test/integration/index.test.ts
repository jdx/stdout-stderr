import {expect} from 'chai'
import chalk from 'chalk'

import {stderr, stdout} from '../../src'

describe('stdout', () => {
  it('mocks', () => {
    stdout.start()
    console.log('foo')
    stdout.stop()
    expect(stdout.output).to.equal('foo\n')
  })

  it('strips color by default', () => {
    stdout.start()
    console.log(chalk.red('foo'))
    stdout.stop()
    expect(stdout.output).to.equal('foo\n')
  })

  it('can disable stripColor', () => {
    stdout.stripColor = false
    stdout.start()
    console.log(chalk.red('foo'))
    stdout.stop()
    expect(stdout.output).to.contain(chalk.red('foo'))
    stdout.stripColor = true
  })
})

describe('stderr', () => {
  it('mocks', () => {
    stderr.start()
    console.error('foo')
    stderr.stop()
    expect(stderr.output).to.equal('foo\n')
  })
})
