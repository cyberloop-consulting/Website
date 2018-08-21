const Metalsmith = require("metalsmith");
require("handlebars-helpers")();
const ghpages = require("gh-pages");
const minimist = require("minimist");
const log = require("debug")("cyberloop");

// Plugins
const debug = require("metalsmith-debug");
const watch = require("metalsmith-watch");
const msIf = require("metalsmith-if");
const drafts = require("metalsmith-drafts");
const layouts = require("metalsmith-layouts");
const permalinks = require("metalsmith-permalinks");
const algolia = require("metalsmith-algolia");

const argv = minimist(process.argv.slice(2), {
  string: ["environment", "algolia"],
  boolean: ["watch", "deploy"],
  alias: { e: "environment", w: "watch", d: "deploy", a: "algolia" },
  default: { environment: "development", watch: false, deploy: false }
});

const environment = argv.environment;
const algoliaPrivateKey = argv.algolia;
const watchEnabled = !!argv.watch;
const shouldDeploy =
  environment === "production" && !watchEnabled && argv.deploy;
const buildDirectory = `./build/${environment}`;

if (shouldDeploy && !algoliaPrivateKey) {
  log("When deploying the Algolia Private Key should be provided!");
  process.exit(1);
}

log("Using environment %o", environment);
if (watchEnabled) log("Livereload enabled, watching for file changes..");
if (shouldDeploy) log("Deployment is enabled");

const metadata = Object.assign(require("./metadata"), {
  environment,
  watchEnabled
});

Metalsmith(__dirname)
  .source("./src")
  .destination(buildDirectory)
  .metadata(metadata)
  .use(drafts())
  .use(
    layouts({
      directory: "./layouts",
      default: "default.hbs"
    })
  )
  .use(
    permalinks({
      pattern: ":title"
    })
  )
  .use(
    msIf(
      watchEnabled,
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
  .use(debug())
  .use(
    msIf(
      algoliaPrivateKey,
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
