import { expect } from 'chai';
import * as chalk from 'chalk';

import { stderr, stdout } from '../../src/index';

describe('stdout', () => {
  it('mocks', () => {
    stdout.start();
    console.log('foo');
    stdout.stop();
    expect(stdout.output).to.equal('foo\n');
  });

  it('strips color by default', () => {
    stdout.start();
    console.log(chalk.red('foo'));
    stdout.stop();
    expect(stdout.output).to.equal('foo\n');
  });

  it('can disable stripColor', () => {
    stdout.stripColor = false;
    stdout.start();
    console.log(chalk.red('foo'));
    stdout.stop();
    expect(stdout.output).to.contain(chalk.red('foo'));
    stdout.stripColor = true;
  });

  it('calls the callback', () => {
    let called = false;
    const mock = () => { called = true; };
    stdout.start();
    process.stdout.write(chalk.red('foo'), () => mock());
    stdout.stop();
    expect(called).to.equal(true);
  });

  it('detects the callback argument correctly', () => {
    let called = false;
    const mock = () => { called = true; };

    stdout.start();
    process.stdout.write("data", 'utf-8', () => mock())
    stdout.stop();

    expect(called).to.equal(true);
  });
});

describe('stderr', () => {
  it('mocks', () => {
    stderr.start();
    console.error('foo');
    stderr.stop();
    expect(stderr.output).to.equal('foo\n');
  });
});
