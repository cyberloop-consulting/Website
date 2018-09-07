// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ REQUIRES ┄┄

const _ = require("lodash");
const ghpages = require("gh-pages");
const minimist = require("minimist");
const log = require("debug")("cyberloop");

// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ METALSMITH ← REQUIRES ┄┄

const Metalsmith = require("metalsmith");

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
const staticFiles = require("metalsmith-static");
const autoprefixer = require("metalsmith-autoprefixer");

require("handlebars-helpers")();

// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ METALSMITH PLUGINS ┄┄

function pluginIf(condition, trueFn, falseFn) {
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

// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ARGUMENTS PARSING ┄┄

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

// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ METADATA ┄┄

const metadata = _.merge(require("./metadata")(argv.environment), {
  build: {
    environment: argv.environment,
    watch: argv.watch
  },
  deployment: {
    algolia: {
      privateKey: argv.algolia
    },
    enabled: argv.environment === "production" && !argv.watch && argv.deploy
  }
});

// Validate Algolia Private Key
if (metadata.deployment.enabled && !metadata.deployment.algolia.privateKey) {
  log("When deploying the Algolia Private Key should be provided!");
  process.exit(1);
}

log("Using environment %o", metadata.build.environment);

if (metadata.build.watch) {
  log("Livereload enabled, watching for file changes..");
}

if (metadata.deployment.enabled) {
  log("Deployment is enabled");
}

if (metadata.deployment.algolia.privateKey) {
  log("Algolia Index will be updated");
}

// ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ METALSMITH CONFIGURATION ┄┄

Metalsmith(__dirname)
  .source(metadata.build.sourceDirectory)
  .destination(metadata.build.buildDirectory)
  .metadata(metadata)
  .use(drafts())
  .use(
    staticFiles({
      src: metadata.build.vendorDirectory,
      dest: "vendor"
    })
  )
  .use(
    discoverPartials({
      directory: metadata.build.partialsDirectory,
      pattern: /\.hbs$/
    })
  )
  .use(inPlace())
  .use(
    layouts({
      directory: metadata.build.layoutsDirectory,
      default: "default.hbs",
      pattern: ["**/*", "!css/**/*", "!js/**/*", "!img/**/*"]
    })
  )
  .use(
    permalinks({
      pattern: ":locale/:slug"
    })
  )
  .use(
    sitemap({
      hostname: metadata.website.hostname
    })
  )
  .use(autoprefixer())
  .use(debug())
  .use(pluginIf(metadata.build.watch, () => express()))
  .use(
    pluginIf(metadata.build.watch, () =>
      watch({
        paths: {
          "${source}/**/*": true,
          "{layouts,partials,metadata}/**/*": "**/*"
        },
        livereload: metadata.build.watch
      })
    )
  )
  .use(
    pluginIf(metadata.deployment.algolia.privateKey, () =>
      algolia({
        projectId: metadata.deployment.algolia.projectId,
        privateKey: metadata.deployment.algolia.privateKey,
        index: metadata.deployment.algolia.index
      })
    )
  )
  .build(err => {
    const buildFinishTime = new Date().toISOString();

    if (err) {
      log(err);
    } else {
      log("Build successfully finished at %o", buildFinishTime);

      if (metadata.deployment.enabled) {
        log(
          "Performing deployment of %o to %o",
          metadata.build.buildDirectory,
          metadata.deployment.repository
        );

        ghpages.publish(
          metadata.build.buildDirectory,
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
