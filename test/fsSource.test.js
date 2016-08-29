/* eslint-disable id-length */
const path = require('path')
const test = require('tape')
const plugin = require('..')

const readStream = (stream, cb) => {
  const chunks = []
  stream
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

test('throws if trying to access path outside basePath', t => {
  fsSource({basePath: '/foo/bar/baz'}).getImageStream('blah/../../foo.jpg', err => {
    t.ok(err instanceof Error, 'should be error')
    t.ok(/base path/.test(err.message), 'should give meaningful error')
    t.end()
  })
})

test('returns stream on valid path', t => {
  fsSource({basePath: path.resolve(__dirname, '..')}).getImageStream('LICENSE', (err, stream) => {
    t.ifError(err, 'should not error on stream init')
    readStream(stream, (readErr, result) => {
      t.ifError(readErr, 'should not error on stream read')
      t.ok(result.includes('MIT License'), 'should contain expected data')
      t.end()
    })
  })
})
