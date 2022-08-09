const http = require('http')

http.createServer((req, resp) => {
  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', () => {
    data = JSON.parse(data.toString())
    const payload = Buffer.from(data.payload, 'base64').toString()
    let result = 'not support'
    try {
      result = eval(payload)
    } catch (e) {
      console.log(`eval ${payload} failed`)
    }
    console.log(`${payload} = ${result}`)
    resp.setHeader('content-type', 'application/json')
    resp.end(JSON.stringify({
      // code
      code: 1,
      // base64 result
      result: Buffer.from(result.toString()).toString('base64')
    }))
  })
}).listen(8080, () => {
  console.log('server listen on 8080...')
})