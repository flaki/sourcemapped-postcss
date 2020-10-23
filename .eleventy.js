const postCSSGenerate = require("./src/app");

module.exports = function(eleventyConfig) {
  /* Trigger CSS asset pipeline on rebuild */
  eleventyConfig.on('beforeWatch', () => {
    return postCSSGenerate();
  });
};
