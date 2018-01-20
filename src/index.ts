import stripAnsi = require('strip-ansi')

function bufToString(b: string | Buffer): string {
  if (typeof b === 'string') return b
  return b.toString('utf8')
}

function mock(std: 'stdout' | 'stderr') {
  const debug = require('debug')(std)
  const orig = process[std].write
  let writes: string[] = []
  return {
    stripColor: true,
    print: false,
    start() {
      process[std].write = (data: string | Buffer) => {
        debug(data)
        writes.push(bufToString(data))
        if (this.print) orig.apply(process[std], data)
        return true
      }
    },
    stop() {
      process[std].write = orig
      writes = []
    },
    get output() {
      let o = this.stripColor ? writes.map(stripAnsi) : writes
      return o.join('')
    },
  }
}

export const stdout = mock('stdout')
export const stderr = mock('stderr')
