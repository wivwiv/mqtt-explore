const coap = require('coap')

const request = coap.request('127.0.0.1:5683')

request.on('request', function(res) {
  res.pipe(process.stdout)
  console.log(res)
  res.on('end', function() {
    console.log('end')
  })
})