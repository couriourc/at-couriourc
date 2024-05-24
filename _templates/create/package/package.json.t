---
to: packages/<%= name %>/package.json
---
{
  "name": "<%=packagePrefix %>/<%= name %>",
  "version": "1.0.0",
  "description": "<%= summary %>",
  "author": "<%= author %> <<%= email %>> ",
  "homepage": "https://github.com/couriourc/at-couriourc/packages/<%= name %>/#readme",
  "license": "MIT",
  "main": "src/index.ts",
  "directories": {
    "dist": "dist",
    "test": "__tests__"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs"
    }
  },
  "files": [
    "dist"
  ],
  "publishConfig": {
    "registry": "https://registry.npmjs.org"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/couriourc/at-couriourc.git"
  },
  "scripts": {
    "dev": "unbuild --stub",
    "build": "unbuild --minify",
    "clean": "pnpx rimraf dist",
    "test": "vitest"
  },
  "bugs": {
    "url": "https://github.com/couriourc/at-couriourc/issues"
  }
}
