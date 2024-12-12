const mqtt = require('mqtt')
const crypto = require('crypto')
const fs = require('fs')

const client = mqtt.connect('mqtts://localhost:8885', {
  rejectUnauthorized: false,
  // ca: [fs.readFileSync('/Users/emqx/Downloads/emqx-503/etc/certs/cacert.pem')],
  pskCallback: (hint) => {
    console.log('psk_hint configured in mosquitto.conf', hint);
    return {
      psk: Buffer.from('admin', 'hex'),
      identity: 'public',
    };
  },
  ciphers: 'RSA-PSK-AES128-CBC-SHA256'// crypto.constants.defaultCipherList.replace(':!PSK', ''),
});

client.on('connect', () => {
  console.log('connected');
  client.subscribe('test', (err) => {
    if (!err) {
      client.publish('test', 'Hello mqtt')
    }
  })
})