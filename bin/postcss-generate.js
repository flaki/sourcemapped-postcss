#!/usr/bin/env node

require('../src/app.js').run().catch(
  e => {
    console.error(e);
    process.exit(1);
  }
);
