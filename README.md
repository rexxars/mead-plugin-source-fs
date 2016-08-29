# mead-plugin-source-fs

[![npm version](http://img.shields.io/npm/v/mead-plugin-source-fs.svg?style=flat-square)](http://browsenpm.org/package/mead-plugin-source-fs)[![Build Status](http://img.shields.io/travis/rexxars/mead-plugin-source-fs/master.svg?style=flat-square)](https://travis-ci.org/rexxars/mead-plugin-source-fs)[![Coverage Status](https://img.shields.io/coveralls/rexxars/mead-plugin-source-fs/master.svg?style=flat-square)](https://coveralls.io/github/rexxars/mead-plugin-source-fs)[![Dependency status](https://img.shields.io/david/rexxars/mead-plugin-source-fs.svg?style=flat-square)](https://david-dm.org/rexxars/mead-plugin-source-fs)

Filesystem source for the Mead image transformer service.  
Loads images from the filesystem, plain and simple!

## Installation

```shell
# Bundled with mead by default, but if you're feeling frisky
npm install --save mead-plugin-source-fs
```

## Usage

**Note: Bundled with Mead and enabled by default**

Your mead configuration file (`mead --config <path-to-config.js>`)

```js
module.exports = {
  // Load the plugin
  plugins: [
    require('mead-plugin-source-fs')
  ],

  sources: [
    {
      name: 'mylocalsource',
      adapter: 'fs',
      config: {
        basePath: '/home/rexxars/Dropbox/Photos'
      }
    }
  ]
}
```

## License

MIT-licensed. See LICENSE.
