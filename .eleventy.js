const postCSSGenerate = require("./src/app");
const DEBUG = process.env.DEBUG;

module.exports = function(eleventyConfig) {
  pcc = postCSSGenerate.config().generate;
  if (DEBUG) console.log(`[postcss-generate] Config:`, pcc);

  /* Add CSS watch targets */
  pcc.from.forEach(
    path => eleventyConfig.addWatchTarget(path)
  );

  /* Trigger CSS asset pipeline on rebuild */
  eleventyConfig.on('beforeWatch', () => {
    if (DEBUG) console.log(`[postcss-generate] --watch fired, rebuilding styles.`);
    return postCSSGenerate.run();
  });

  /* Run inital build */
  if (DEBUG) console.log(`[postcss-generate] Initial style generation...`);
  return postCSSGenerate.run();
  /* TODO: https://www.11ty.dev/docs/events/#beforebuild */
};
