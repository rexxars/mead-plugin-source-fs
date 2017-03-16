/* eslint-disable id-length */
const path = require('path')
const test = require('tape')
const stream = require('stream')
const plugin = require('..')

const mockFs = err => ({
  createReadStream: () => {
    const rs = new stream.Readable()
    rs._read = () => rs.emit('error', err)
    return rs
  }
})

const readStream = (inStream, cb) => {
  const chunks = []
  inStream
    .on('data', d => chunks.push(d))
    .on('error', cb)
    .on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')))
}

const fsSource = plugin.handler

test('has plugin props', t => {
  ['name', 'type', 'handler'].forEach(prop => {
    t.ok(plugin[prop])
  })
  t.end()
})

test('exposes source plugin props', t => {
  const src = fsSource({basePath: '/'})
  t.equal(typeof src.getImageStream, 'function', 'exposes `getImageStream()`')
  t.equal(typeof src.requiresSignedUrls, 'boolean', 'exposes `requiresSignedUrls`')
  t.end()
})

test('does not require signed urls by default', t => {
  t.notOk(fsSource({basePath: '/'}).requiresSignedUrls)
  t.end()
})

test('throws on missing `basePath`', t => {
  t.throws(() => fsSource({foo: 'bar'}), /basePath/)
  t.end()
})

test('throws 400 if trying to access path outside basePath', t => {
  fsSource({basePath: '/foo/bar/baz'}).getImageStream({urlPath: 'blah/../../foo.jpg'}, err => {
    t.ok(err instanceof Error, 'should be error')
    t.ok(/base path/.test(err.message), 'msg should contain base path')
    t.end()
  })
})

test('throws 404 if file does not exist', t => {
  fsSource({basePath: __dirname}).getImageStream({urlPath: 'foo.jpg'}, err => {
    t.ok(err instanceof Error, 'should error')
    t.ok(/not found/i.test(err.message), 'msg should contain not found')
    t.end()
  })
})

test('throws 404 if path is a directory', t => {
  fsSource({basePath: path.join(__dirname, '..')}).getImageStream({urlPath: 'test'}, err => {
    t.ok(err instanceof Error, 'should error')
    t.ok(/not found/i.test(err.message), 'msg should contain not found')
    t.end()
  })
})

test('throws 403 on permission denied', t => {
  const streamErr = new Error('Permission denied')
  streamErr.code = 'EACCES'

  fsSource({basePath: __dirname, fs: mockFs(streamErr)}).getImageStream({urlPath: 'test'}, err => {
    t.ok(err instanceof Error, 'should error')
    t.ok(/permission denied/i.test(err.message), 'msg should contain permission denied')
    t.end()
  })
})

test('throws 503 on too many open files', t => {
  const streamErr = new Error('Too many open files')
  streamErr.code = 'EMFILE'

  fsSource({basePath: __dirname, fs: mockFs(streamErr)}).getImageStream({urlPath: 'test'}, err => {
    t.ok(err instanceof Error, 'should error')
    t.ok(/temporarily unavailable/i.test(err.message), 'msg should contain temporarily unavailable')
    t.end()
  })
})

test('throws 500 on unknown errors', t => {
  const streamErr = new Error('Not sure')
  fsSource({basePath: __dirname, fs: mockFs(streamErr)}).getImageStream({urlPath: 'test'}, err => {
    t.ok(err instanceof Error, 'should error')
    t.equal(err.output.statusCode, 500, 'should be 500 error')
    t.ok(!/Not sure/.test(err.output.message), 'original error should not be exposed to user')
    t.end()
  })
})

test('returns stream on valid path', t => {
  fsSource({basePath: path.resolve(__dirname, '..')}).getImageStream({urlPath: 'LICENSE'}, (err, imgStream) => {
    t.ifError(err, 'should not error on stream init')
    readStream(imgStream, (readErr, result) => {
      t.ifError(readErr, 'should not error on stream read')
      t.ok(result.includes('MIT License'), 'should contain expected data')
      t.end()
    })
  })
})
