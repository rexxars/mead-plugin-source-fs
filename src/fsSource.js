const path = require('path')
const Boom = require('boom')

function fsSource(config) {
  if (!config.basePath) {
    throw new Error('`basePath` is required for `fs`-source to work')
  }

  const fs = config.fs || require('fs')

  return {getImageStream, requiresSignedUrls: false}

  function getImageStream(context, callback) {
    const urlPath = context.urlPath
    const fsPath = path.sep === '/' ? urlPath : urlPath.replace(/\//g, path.sep)
    const imgPath = path.normalize(path.join(config.basePath, fsPath))

    if (imgPath.indexOf(config.basePath) !== 0) {
      setImmediate(callback, Boom.badRequest('Path points outside of base path'))
      return
    }

    const stream = fs.createReadStream(imgPath)
      .once('readable', () => callback(null, stream))
      .on('error', err => callback(wrapError(err)))
  }
}

function wrapError(err) {
  switch (err.code) {
    case 'ENOENT':
    case 'EISDIR':
      return Boom.notFound('Image not found')
    case 'EACCES':
      return Boom.forbidden('Permission denied')
    case 'EMFILE':
      return Boom.serverUnavailable('Temporarily unavailable', {
        code: err.code,
        message: 'Too many open files (EMFILE)'
      })
    default:
      return Boom.badImplementation(err)
  }
}

module.exports = {
  name: 'fs',
  type: 'source',
  handler: fsSource
}
