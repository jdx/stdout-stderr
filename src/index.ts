import stripAnsi = require('strip-ansi')

const debug = require('debug')('stdout-stderr')

export interface MockStd {
  /**
   * strip color with ansi-strip
   *
   * @default true
   */
  stripColor: boolean
  /**
   * also print to console
   *
   * @default false
   */
  print: boolean
  /** get what has been written to stdout/stderr */
  readonly output: string
  /** start mocking */
  start(): void
  /** stop mocking */
  stop(): void
}

/** mocks stdout or stderr */
function mock(std: 'stdout' | 'stderr'): MockStd {
  const orig = process[std].write
  let writes: string[] = []
  return {
    stripColor: true,
    print: false,
    start() {
      debug('start', std)
      writes = []
      process[std].write = (data: string | Buffer, ...args: any[]) => {
        writes.push(bufToString(data))
        if (this.print) orig.apply(process[std], [data, ...args])
        return true
      }
    },
    stop() {
      process[std].write = orig
      debug('stop', std)
    },
    get output() {
      let o = this.stripColor ? writes.map(stripAnsi) : writes
      return o.join('')
    },
  }
}

export const stdout = mock('stdout')
export const stderr = mock('stderr')

function bufToString(b: string | Buffer): string {
  if (typeof b === 'string') return b
  return b.toString('utf8')
}
