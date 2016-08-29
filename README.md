# mead-plugin-source-fs

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
