
/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */
module.exports = {
  "ui": {
    "port": 3001
  },
  "files": false,
  "watchEvents": [
    "change",
    "add",
    "unlink",
    "addDir"
  ],
  "watch": true,
  "ignore": [],
  "watchOptions": {
    "ignoreInitial": true
  },
  "server": {
    "baseDir": "./dist/",
    "index": "index.html"
  }
};
