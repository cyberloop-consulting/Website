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
const buildDirectory = `./build/${environment}`;
const sourceDirectory = "./src";

if (shouldDeploy && !algoliaPrivateKey) {
  log("When deploying the Algolia Private Key should be provided!");
  process.exit(1);
}

log("Using environment %o", environment);
if (watchEnabled) log("Livereload enabled, watching for file changes..");
if (shouldDeploy) log("Deployment is enabled");
if (algoliaPrivateKey) log("Updating Algolia Index");

const metadata = Object.assign(require("./metadata"), {
  environment,
  watchEnabled
});

m = Metalsmith(__dirname);
m.source(sourceDirectory);
m.destination(buildDirectory);
m.metadata(metadata);
m.use(drafts());
m.use(inPlace());
m.use(
  layouts({
    directory: "./layouts",
    default: "default.hbs"
  })
);
m.use(
  permalinks({
    pattern: ":title"
  })
);
if (watchEnabled) {
  m.use(express());
  m.use(
    watch({
      paths: {
        "${source}/**/*": true,
        "layouts/**/*": "**/*",
        "metadata/**/*": "**/*"
      },
      livereload: watchEnabled
    })
  );
}
if (algoliaPrivateKey) {
  m.use(
    algolia({
      projectId: "RFJN6AJVVQ",
      privateKey: algoliaPrivateKey,
      index: "CONTENT"
    })
  );
}
m.use(
  sitemap({
    hostname: metadata.website.hostname
  })
);
m.use(debug());
m.build(err => {
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
