import stripAnsi = require('strip-ansi')

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
  const debug = require('debug')(std)
  const orig = process[std].write
  let writes: string[] = []
  function _debug(msg: string | Buffer) {
    if (!debug.enabled) return
    // remap writer to allow it to send to debug
    const prev = process[std].write
    process[std].write = orig
    debug(msg)
    process[std].write = prev
  }
  return {
    stripColor: true,
    print: false,
    start() {
      writes = []
      process[std].write = (data: string | Buffer) => {
        _debug(data)
        writes.push(bufToString(data))
        if (this.print) orig.apply(process[std], data)
        return true
      }
    },
    stop() {
      process[std].write = orig
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
