# frinx-workflow-ui

The Frinx workflow user interface

## Installation

To build as standalone:
```bash
npm install
npm start
```
http://localhost:8080

## npm publish

Build:
```
npm run transpile
```

Create new empty folder and copy following folders and files
```
lib/  package.json  package-lock.json  README.md
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

