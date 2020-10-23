const postCSSGenerate = require("./src/app");

module.exports = function(eleventyConfig) {
console.log(eleventyConfig)
  /* Trigger CSS asset pipeline on rebuild */
  eleventyConfig.on('beforeWatch', () => {
    return postCSSGenerate();
  });
};
