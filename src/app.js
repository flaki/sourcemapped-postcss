const postcss = require('postcss');

const sourcemapConcat = require('concat-with-sourcemaps');

const fs = require('fs-extra');
const { dirname, basename, resolve } = require('path');

const DEBUG = process.env.DEBUG;

let CONFIG, CONFIGDIR;

// Convenience function for resolving relative references to the config directory
// This will keep absolute paths intact
let cd = (path) => resolve(CONFIGDIR, path);

// Throws if no config file
try {
  // TODO: make configurable?
  const configPath = resolve(process.cwd(), './postcss.config');
  let configFile = require(configPath);

  // Update configdir
  CONFIGDIR = dirname(configPath);

  console.log(`PostCSS config detected at ${CONFIGDIR}`);

  // Function callback
  if (typeof configFile === 'function') {
    CONFIG = configFile.call(null, {
      options: {}
    });

  // Config object
  } else if (typeof configFile === 'object') {
    CONFIG = configFile;

  // Invalid config file
  } else {
    throw(new Error('Invalid config file!'));
  }
}
catch(e) {
  console.error(e.message);
  console.error('Make sure you configure postcss-generate first!');
  console.error('Check the docs to see how to use the "generate" property of postcss.config.js!');
  process.exit(1);
}


function mkProcessOpts(src) {
  return ({
    map: {
      // Disable inline source maps to ensure .map is populated
      inline: false,
      // Turn off annotations (not needed since we're concating)
      annotation: false
    },
    from: src,
    to: `${CONFIG.generate.outdir}${src}`
  });
}

async function transform(processor, src) {
  let pOpts = mkProcessOpts(src);
  let sourceCss = await fs.readFile(pOpts.from);
  if (DEBUG) console.log(`[postcss-generate] >> ${cd(pOpts.from)}`);

  // Make sure output dir exists
  await fs.ensureDir(dirname(pOpts.to));

  // Transform source
  let result = await processor.process(sourceCss, pOpts);

  // Only write resulting files, do not concatenating (no outfile specified)
  if (!CONFIG.generate.outfile) {
    await fs.writeFile(cd(pOpts.to), result.css);
    if (DEBUG) console.log(`[postcss-generate] CSS out: ${cd(pOpts.to)}`);



    if (result.map) {
      await fs.writeFile(cd(`${pOpts.to}.map`), concatenated.map);
      if (DEBUG) console.log(`[postcss-generate] Mapfile out: ${cd(pOpts.to+'.map')}`);
    }
  }

  // Return full processing results for further processing
  return result;
}

async function concat(results, outfile, opts = {}) {
  let out = new sourcemapConcat(true, outfile, '\n');

  // Add a header (optional)
  if (opts.header) out.add(null, opts.header);

  for (const { opts, css, map } of results) {
    // NOTE: for some inputs stripping the entire file path
    // might not be desirable
    // TODO: make this optional/configurable?
    const filename = basename(opts.from);

    // Original source filename (with full path)
    // TODO: this isn't strictly neccessary - maybe make it optional?
    out.add(null, `/* ${opts.from} */`);

    out.add(filename, css.toString(), map.toString());
  }

  // Link generated source map
  out.add(null, `/*# sourceMappingURL=${basename(outfile)}.map */`);

  const concatenated = {
    css: out.content,  // note: is a buffer
    map: out.sourceMap // note: is a string
  }

  // Make sure output dir exists
  await fs.ensureDir(dirname(outfile));

  // Transform source and write resulting CSS
  await fs.writeFile(cd(outfile), concatenated.css);
  if (DEBUG) console.log(`[postcss-generate] CSS (concat) out: ${cd(outfile)}`);

  await fs.writeFile(cd(`${outfile}.map`), concatenated.map);
  if (DEBUG) console.log(`[postcss-generate] Mapfile out: ${cd(outfile+'.map')}`);

  return concatenated;
}

module.exports = async function run() {
  // Create a processor by using the plugins from the config file
  const processor = postcss(CONFIG.plugins);

  // Process source files
  let results = await Promise.all(
    CONFIG.generate.from.map(
      sourceFile => transform(processor, sourceFile)
    )
  );

  // Concatenate all sources into a single source-mapped outfile
  let concatresult = await concat(results, CONFIG.generate.outfile, {
    header: CONFIG.generate.header,
  });

  console.log(`[postcss-generate] Updated CSS build.`);
};
