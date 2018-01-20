import {expect} from 'chai'

import {stdout, stderr} from '../../src'

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
