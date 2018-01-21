import {expect} from 'chai'

import {stderr, stdout} from '../../src'

describe('stdout', () => {
  it('mocks', () => {
    stdout.start()
    console.log('foo')
    stdout.stop()
    expect(stdout.output).to.equal('foo\n')
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

describe('debug', () => {
  it('does not fail', () => {
    process.env.DEBUG = '*'
    stderr.start()
    console.error('foo')
    stderr.stop()
    expect(stderr.output).to.equal('foo\n')
  })
})
