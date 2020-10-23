#!/usr/bin/env node

require('../src/app.js')().catch(
  e => {
    console.error(e);
    process.exit(1);
  }
);
