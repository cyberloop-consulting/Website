module.exports = environment => ({
  sourceDirectory: "./src",
  partialsDirectory: "./partials",
  layoutsDirectory: "./layouts",
  buildDirectory: `./build/${environment}`,
  vendorDirectory: "./vendor"
});
