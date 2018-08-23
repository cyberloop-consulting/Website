# CyberLoop Consulting Official Website

This repository holds the source code of CyberLoop Consulting Official Website.

## Usage

To build the website use the command:

```
npm run build
```

The command accepts the following arguments:

- `--watch` to enable watch mode
- `--environment=<env>` to specify a build environment, supported are:
    - `development` (*default*)
    - `production`
- `--algolia=<pkey>` to specify Algolia private key, if provided the content index will be updated
- `--deploy` to perform deployment after build (if successful)

To correctly pass arguments you need to include `--` between the command and the arguments.

## Directory Structure

- `src`: website source code, including HTML pages and custom CSS, JS, images
- `vendor`: third-party dependencies
- `layouts`: layouts for website pages
- `metadata`: additional data that will be available in layouts
- `build`: built artifacts
    - `build/development`: built artifacts in "development" environment
    - `build/production`: built artifacts in "development" environment

## Updating

This website is based on `Ezy` template.
When a new version is released, this website should be updated accordingly, based on the following rules:

- Dump `ezy/vendor` folder to `vendor`
- Dump `ezy/js` folder to `src/js/ezy`
- Dump `ezy/css` folder to `src/css/ezy`
- Dump `ezy/img` folder to `src/img/ezy`

**Update CSS files to reference images correctly**, changing url(...) to point to the correct image path inside
`/img/ezy` folder.
