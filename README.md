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
- `--deploy` to perform deployment after build (if successful)

To correctly pass arguments you need to include `--` between the command and the arguments.

## Directory Structure

- `src`: website pages
- `layouts`: layouts for website pages
- `metadata`: additional data that will be available in layouts
- `build`: built artifacts
    - `build/development`: built artifacts in "development" environment
    - `build/production`: built artifacts in "development" environment
