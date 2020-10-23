# eleventy-plugin-sourcemapped-postcss

Generate production CSS from PostCSS sources. The plugin takes care of regenerating sources before Eleventy's `--watch` process reloads the browser.

The sources are compiled by PostCSS and run through the configured plugins, after which they are minified into a single output file. All configuration shall exist in `postcss-config.js`.

The build script ensures that processed and minified CSS is generated with source maps, which in most supporting modern browsers allow for debugging using the unminified original sources in the browser's Developer Tools.
