/**
 * File Transfer over MQTT
 * @emqx EMQX Enterprise v5.1.0+
 * @document https://docs.emqx.com/en/enterprise/v5.1/file-transfer/introduction.html
 */

const fs = require('fs')
const path = require('path')
const mqtt = require('mqtt')

const FILE_PATH = '/Users/emqx/Downloads/mqttx-cli-macos-x64'
// File segment size, default is 20KB, muse be less than `mqtt.max_packet_size` (default is 1024KB)
const SEGMENT_SIZE = 1024 * 20

// Only support EMQX Enterprise v5.1.0+ and need to enable file transfer
const HOST = 'mqtt://192.168.124.18:1883'

// Get file information
const fileSize = fs.statSync(FILE_PATH).size
const fileName = FILE_PATH.split('/').pop()
const fileChecksum = calculateChecksum(FILE_PATH)


async function up(client, fileid) {
  const initCommand = {
    name: fileName,
    size: fileSize,
    checksum: fileChecksum,
  }

  const timeStart = Date.now()

  // Use file checksum as file_id
  const initTopic = `$file/${fileid}/init`
  const packet = await publishMessage(client, initTopic, JSON.stringify(initCommand), { qos: 1 })
  console.log('File transfer session initialized.', packet)

  // Read file and publish segments
  const fileStream = fs.createReadStream(FILE_PATH, { highWaterMark: SEGMENT_SIZE })
  let offset = 0

  fileStream.on('data', async (chunk) => {
    // Publish file segment, the offset is file segment start position
    const segmentTopic = `$file/${fileid}/${offset}`
    offset += chunk.length
    let _offset = offset
    await publishMessage(client, segmentTopic, chunk, { qos: 1 })
    console.log(`File segment ${_offset} sent.`)
  })

  fileStream.on('end', async () => {
    const finishTopic = `$file/${fileid}/fin/${fileSize}`
    const packet = await publishMessage(client, finishTopic, null, { qos: 1 })
    console.log('File transfer finished.', packet)
    const timeEnd = Date.now()
    console.table({
      'File ID': fileid,
      'Transfer Speed': bytesFormatter((fileSize / (timeEnd - timeStart) * 1000)) + '/s'
    })
  })
}

function run(count = 10, times = 1000) {
  // 创建 count 个客户端
  const clients = []
  for (let i = 0; i < count; i++) {
    const client = mqtt.connect(HOST, { clientId: 'ft-' + i })
    client.on('connect', () => {
      // 发送 times 次文件
      for (let i = 0; i < times; i++) {
        up(client, i)
      }
    })
    clients.push(client)
  }
}

run(10, 10)




/**
 * Publish a message to the MQTT broker
 * @param {string} topic MQTT topic to publish the message to
 * @param {string | Buffer} message The message payload
 * @param {Object} options Additional options for publishing (e.g., qos)
 * @returns {Promise} A promise that resolves when the message is published
 */
function publishMessage(client, topic, message, options) {
  return new Promise((resolve, reject) => {
    client.publish(topic, message, options, (error, packet) => {
      if (!error) {
        resolve(packet)
      } else {
        reject(error)
      }
    })
  })
}

/**
 * Calculate file checksum
 * @param {string} filePath file path
 * @return {*}
 */
function calculateChecksum(filePath) {
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256')
  const fileData = fs.readFileSync(filePath)
  hash.update(fileData)
  return hash.digest('hex')
}


/**
 * Format file size
 * @param {number} fileSize
 * @return {*} 
 */
function bytesFormatter(fileSize) {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let index = 0
  let size = fileSize
  while (size > 1024) {
    size /= 1024
    index++
  }
  return size.toFixed(2) + ' ' + units[index]
}