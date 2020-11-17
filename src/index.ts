import stripAnsi = require('strip-ansi')

const debug = require('debug')('stdout-stderr');

const g: any = global;
if (!g['stdout-stderr']) {
  g['stdout-stderr'] = {
    stdout: process.stdout.write,
    stderr: process.stderr.write,
  };
}

function bufToString(b: string | Buffer): string {
  if (typeof b === 'string') return b;
  return b.toString('utf8');
}

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

const originalConsoleLog = console.log;

/** mocks stdout or stderr */
function mock(std: 'stdout' | 'stderr'): MockStd {
  let writes: string[] = [];
  return {
    stripColor: true,
    print: false,
    start() {
      debug('start', std);
      writes = [];
      process[std].write = (data: string | Buffer, ...args: any[]) => {
        writes.push(bufToString(data));
        if (this.print) {
          g['stdout-stderr'][std].apply(process[std], [data, ...args]);
        } else if (args.length > 0) {
          const callback = args[args.length - 1];
          if (typeof callback === 'function') {
            callback();
          }
        }
        return true;
      };
      if (std === 'stdout') {
        console.log = (...args: any[]) => {
          process.stdout.write(`${args.join(' ')}\n`);
        };
      }
    },
    stop() {
      process[std].write = g['stdout-stderr'][std];
      if (std === 'stdout') console.log = originalConsoleLog;
      debug('stop', std);
    },
    get output() {
      const o = this.stripColor ? writes.map(stripAnsi) : writes;
      return o.join('');
    },
  };
}

export const stdout = mock('stdout');
export const stderr = mock('stderr');
