const Metalsmith = require("metalsmith");

require("handlebars-helpers")();
const ghpages = require("gh-pages");
const minimist = require("minimist");
const log = require("debug")("cyberloop");

// Plugins
const debug = require("metalsmith-debug");
const watch = require("metalsmith-watch");
const drafts = require("metalsmith-drafts");
const layouts = require("metalsmith-layouts");
const permalinks = require("metalsmith-permalinks");
const algolia = require("metalsmith-algolia");
const express = require("metalsmith-express");
const sitemap = require("metalsmith-sitemap");
const inPlace = require("metalsmith-in-place");
const discoverPartials = require("metalsmith-discover-partials");

const argv = minimist(process.argv.slice(2), {
  string: ["environment", "algolia"],
  boolean: ["watch", "deploy"],
  alias: { e: "environment", w: "watch", d: "deploy", a: "algolia" },
  default: {
    environment: "development",
    watch: false,
    deploy: false,
    algolia: null
  }
});

const environment = argv.environment;
const algoliaPrivateKey = argv.algolia;
const watchEnabled = !!argv.watch;
const shouldDeploy =
  environment === "production" && !watchEnabled && argv.deploy;

const sourceDirectory = "./src";
const partialsDirectory = "./partials";
const layoutsDirectory = "./layouts";
const buildDirectory = `./build/${environment}`;

if (shouldDeploy && !algoliaPrivateKey) {
  log("When deploying the Algolia Private Key should be provided!");
  process.exit(1);
}

log("Using environment %o", environment);
if (watchEnabled) log("Livereload enabled, watching for file changes..");
if (shouldDeploy) log("Deployment is enabled");
if (algoliaPrivateKey) log("Algolia Index will be updated");

const metadata = Object.assign(require("./metadata"), {
  environment,
  watchEnabled
});

function iif(condition, trueFn, falseFn) {
  if (condition) {
    return trueFn();
  } else if (falseFn) {
    return falseFn();
  } else {
    return function(files, metalsmith, done) {
      done();
    };
  }
}

Metalsmith(__dirname)
  .source(sourceDirectory)
  .destination(buildDirectory)
  .metadata(metadata)
  .use(drafts())
  .use(inPlace())
  .use(
    layouts({
      directory: layoutsDirectory,
      default: "default.hbs",
      pattern: ["**/*", "!css/**/*", "!js/**/*", "!vendor/**/*"]
    })
  )
  .use(
    discoverPartials({
      directory: partialsDirectory,
      pattern: /\.hbs$/
    })
  )
  .use(
    permalinks({
      pattern: ":title"
    })
  )
  .use(
    sitemap({
      hostname: metadata.website.hostname
    })
  )
  .use(debug())
  .use(iif(watchEnabled, m => m.use(express())))
  .use(
    iif(watchEnabled, () =>
      watch({
        paths: {
          "${source}/**/*": true,
          "layouts/**/*": "**/*",
          "metadata/**/*": "**/*"
        },
        livereload: watchEnabled
      })
    )
  )
  .use(
    iif(algoliaPrivateKey, () =>
      algolia({
        projectId: "RFJN6AJVVQ",
        privateKey: algoliaPrivateKey,
        index: "CONTENT"
      })
    )
  )
  .build(err => {
    const buildFinishTime = new Date().toISOString();

    if (err) {
      log(err);
    } else {
      log("Build successfully finished at %o", buildFinishTime);

      if (shouldDeploy) {
        log(
          "Performing deployment of %o to %o",
          buildDirectory,
          metadata.deployment.repository
        );

        ghpages.publish(
          buildDirectory,
          {
            branch: metadata.deployment.branch,
            repo: metadata.deployment.repository,
            message: `Website Built at ${buildFinishTime}`
          },
          err => {
            if (err) {
              log(err);
            } else {
              log("Deployment successfully finished");
            }
          }
        );
      }
    }
  });
