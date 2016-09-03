const path = require('path')
const fs = require('fs')
const Boom = require('boom')

function fsSource(config) {
  if (!config.basePath) {
    throw new Error('`basePath` is required for `fs`-source to work')
  }

  return {getImageStream, requiresSignedUrls: false}

  function getImageStream(urlPath, callback) {
    const fsPath = path.sep === '/' ? urlPath : urlPath.replace(/\//g, path.sep)
    const imgPath = path.normalize(path.join(config.basePath, fsPath))

    if (imgPath.indexOf(config.basePath) !== 0) {
      setImmediate(callback, Boom.badRequest('Path points outside of base path'))
      return
    }

    const stream = fs.createReadStream(imgPath)
      .once('readable', () => callback(null, stream))
      .on('error', err => {
        if (err.code === 'ENOENT') {
          return callback(Boom.notFound('Image not found'))
        }

        if (err.code === 'EACCES') {
          return callback(Boom.forbidden('Permission denied'))
        }

        return callback(Boom.badImplementation(err))
      })
  }
}


module.exports = {
  name: 'fs',
  type: 'source',
  handler: fsSource
}
