module.exports = environment => ({
  company: require("./company")(),
  deployment: require("./deployment")(),
  build: require("./build")(environment),
  website: require("./website")()
});
