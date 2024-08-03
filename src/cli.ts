#!/usr/bin/env node

import {program} from 'commander';
import { createMockServer } from '.';
const app = program
  .option('-p, --port <number>', 'mock server port', parseInt)
  .option('-g, --glob <string>', 'glob pattern')
  .option('-h, --host <string>', 'mock server host')

app.action(
  async (
    args: Partial<{port:number, glob: string, host:string}>
  ) => {
    const {port=8848, glob='./mock/**/*.js',host='0.0.0.0'} = args
    await createMockServer({
      hostname: host,
      port,
      pattern: glob
    })
  }
)
app.parse();