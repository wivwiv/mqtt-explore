const http = require('http')

http.createServer((req, res) => {
  let body = ''
  req.on('data', (data) => {
    body += data
  })
  req.on('end', () => {
    try {
      const d = JSON.parse(body.toString())
      console.log(JSON.stringify(d))
    } catch (e) {
    }
  })
  res.end('')
}).listen(8090,() => {
  console.log('Listen on 8090')
})