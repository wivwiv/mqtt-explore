const mqtt = require('mqtt');

const server = 'mqtts://139.9.180.163:8883'; // MQTT服务器地址
const numClients = 500; // 要模拟的客户端数量

// 连接参数，这里不验证证书
const options = {
  rejectUnauthorized: false,
};

// 创建并连接多个 MQTT 客户端
const clients = [];
for (let i = 0; i < numClients; i++) {
  const client = mqtt.connect(server, options);

  client.on('connect', () => {
    console.log(`Client ${i + 1} connected`);
    setInterval(() => {
      const currentTime = new Date().toLocaleString();
      client.publish(`t/${client.clientId}`, JSON.stringify({
        currentTime: currentTime,
        clientId: client.clientId,
      })); // 发布当前时间到主题
      console.log(`Client ${i + 1} published: ${currentTime}`);
    }, 10000); // 每10秒发布一次
  });

  clients.push(client);
}

// 处理错误
clients.forEach((client, i) => {
  client.on('error', (error) => {
    console.error(`Client ${i + 1} error: ${error}`);
  });
});
