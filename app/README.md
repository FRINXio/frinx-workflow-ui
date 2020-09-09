# frinx-workflow-ui

UI for managing workflows

## Components

- `/api`
    - workflow proxy - redirects requests to conductor endpoints
- `/app`
    - React web app
- `/server`
    - server that hosts web app
    - redirects UI requests to workflow proxy

## Installation

To build as standalone:
```bash
cd app && npm install
npm start
```
http://localhost:3000

## npm publish

Build:
```
npm run transpile
```

Change version in package.json to e.g. 1.1.19

Login to NPM:
```
npm login
```

And push to NPM:
```
npm publish --access public
```

