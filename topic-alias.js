const mqtt = require('mqtt');

// 连接到 EMQX broker，指定使用 MQTT 5.0 协议
const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
    protocolVersion: 5,  // 使用 MQTT 5.0
    properties: {
        topicAliasMaximum: 5  // 设置最大主题别名数量
    }
});

client.on('connect', () => {
    console.log('Connected to broker.emqx.io:1883 with MQTT 5.0');

    // 订阅主题
    client.subscribe('test/topic', { qos: 0 }, (err) => {
        if (!err) {
            console.log('Subscribed to topic: test/topic');

            // 发送第一个消息，使用正常的主题
            client.publish('test/topic', 'Message with topic alias 1', {
                qos: 0,
                properties: {
                    topicAlias: 1  // 设置主题别名为 1
                }
            }, (err) => {
                if (err) {
                    console.error('Error publishing with topic alias:', err);
                } else {
                    console.log('Published message with topic alias 1');
                }
            });

            // 发送第二个消息，使用主题别名
            client.publish('', 'Message using topic alias 1', {
                qos: 0,
                properties: {
                    topicAlias: 1  // 使用已经定义的主题别名 1
                }
            }, (err) => {
                if (err) {
                    console.error('Error publishing with topic alias 1:', err);
                } else {
                    console.log('Published message using topic alias 1');
                }
            });

        } else {
            console.error('Error subscribing to topic:', err);
        }
    });
});

// 监听收到的消息
client.on('message', (topic, message) => {
    console.log(`Received message from topic: ${topic}, message: ${message.toString()}`);
});

client.on('error', (err) => {
    console.error('Connection error:', err);
});

client.on('close', () => {
    console.log('Connection closed');
});
