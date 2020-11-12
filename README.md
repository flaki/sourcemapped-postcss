# Sourcemapped PostCSS

Generate production CSS from PostCSS sources. The sources are compiled by PostCSS and run through the configured plugins, after which they are minified into a single output file (this can be turned off via ENV vars). Otherwise, all configuration shall exist in `postcss-config.js`.

The build script ensures that processed and minified CSS is generated with source maps, which in most supporting modern browsers allow for debugging using the unminified original sources in the browser's Developer Tools.
