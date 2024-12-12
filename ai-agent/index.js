/**
 * 智能家居 AI 助手
 * 通过 MQTT 协议接收设备上报的指令，调用 AI 进行处理，并返回处理结果
 * 
 * 设备层        边缘层          消息层        处理层         AI 层
 * +--------+   +---------+   +-------+   +---------+   +---------+
 * |智能设备|<->|边缘AI   |   |       |   |         |   |         |
 * |传感器  |   |网关     |<->| EMQX  |<->| Agent   |<->| Azure   |
 * |执行器  |   |协议转换 |   |       |   | Service |   | AI       |
 * +--------+   +---------+   +-------+   +---------+   +---------+
 */
const axios = require('axios');
const mqtt = require('mqtt');

// ================ 配置项 ================

// API 配置
const CONFIG = {
  // OpenAI API 配置
  OPENAI_API_KEY: '****',
  OPENAI_API_URL: 'https://xxxxxx.com/v1/chat/completions',
  // AI 模型配置
  AI_MODEL: {
    DEFAULT: 'gpt-4o',
    SMART_HOME: 'gpt-4o',
    FRIDGE: 'gpt-4o',
    WEARABLE: 'gpt-4o'
  }
}

// MQTT 配置
const MQTT_BROKER = 'mqtt://broker.emqx.io:1883';
const MQTT_OPTIONS = {
  clientId: 'ai-agent-' + Math.random().toString(16).substring(2, 8),
  username: '',
  password: '',
  reconnectPeriod: 5000 // 断线重连间隔(ms)
};

// 响应格式配置
const attentionDistance = `请以JSON数组格式返回控制指令。
**注意，只返回 JSON，不要有其他任何内容。例如代码符号 \`\`\`、\`\`\`json其他描述语句 **`

// ================ 场景配置 ================

const SCENARIOS = {
  // 智能家居场景
  smarthome: {
    subTopic: 'smarthome/control/+', // + 用于匹配房间ID
    pubTopicPrefix: 'demo_down/smarthome/device/',
    model: CONFIG.AI_MODEL.SMART_HOME,
    systemPrompt: `你是一个智能家居控制助手。请根据用户的自然语言指令，生成相应的设备控制指令。
可控制的设备包括:
- 语音助手(voiceAssistant): {"device":"voiceAssistant","action":"on/off","mode":"normal/sleep","timer":{"on":"HH:mm","off":"HH:mm"}, "voice":"你好，我是你的语音助手，有什么可以帮您的？"}
- 灯光(light): {"device":"light","action":"on/off","brightness":0-100,"color":"rgb(r,g,b)","colorTemp":2700-6500,"timer":{"on":"HH:mm","off":"HH:mm"}}
- 空调(ac): {"device":"ac","action":"on/off","temperature":16-30,"mode":"cool/heat/auto/sleep","fanSpeed":1-5,"swing":"on/off","timer":{"on":"HH:mm","off":"HH:mm"}}
- 窗帘(curtain): {"device":"curtain","action":"open/close","position":0-100,"mode":"auto/manual","timer":{"open":"HH:mm","close":"HH:mm"}}
- 晾衣架(clothesHanger): {"device":"clothesHanger","action":"up/down","position":0-100,"drying":"on/off","timer":{"up":"HH:mm","down":"HH:mm"}}
- 洗衣机(washer): {"device":"washer","action":"start/pause/stop","mode":"standard/quick/heavy/wool/delicate","temperature":0-95,"spin":400-1400,"timer":{"start":"HH:mm"}}
- 新风系统(ventilation): {"device":"ventilation","action":"on/off","speed":1-5,"mode":"auto/manual","pm25Threshold":0-150,"timer":{"on":"HH:mm","off":"HH:mm"}}
- 地暖(floorHeating): {"device":"floorHeating","action":"on/off","temperature":20-35,"mode":"day/night","timer":{"on":"HH:mm","off":"HH:mm"}}
- 门锁(lock): {"device":"lock","action":"lock/unlock","mode":"auto/manual","alarm":"on/off","timer":{"lock":"HH:mm","unlock":"HH:mm"}}
- 扫地机器人(vacuum): {"device":"vacuum", "", "action":"start/pause/dock","mode":"auto/spot/edge","power":1-3,"timer":{"start":"HH:mm","dock":"HH:mm"}}
- 加湿器(humidifier): {"device":"humidifier","action":"on/off","humidity":30-80,"mode":"auto/sleep","timer":{"on":"HH:mm","off":"HH:mm"}}
- 电视(tv): {"device":"tv","action":"on/off/openApp/openAppAndSearch","app":"netflix/youtube/prime/hulu/bilibili/iqiyi/tencent","searchKeyword":"搜索关键词","volume":0-100,"brightness":0-100,"mode":"normal/movie/game/sleep","channel":1-999,"source":"hdmi1/hdmi2/usb/tv","timer":{"on":"HH:mm","off":"HH:mm","sleep":"HH:mm"}}
- 冰箱(fridge): {"device":"fridge","action":"flushFoodList"}
- 家庭机器人(homebot): {"device":"homebot","action":"getFoodFromFridge/cleanRoom/washDishes/foldClothes","target":"食物名称","room":"房间名称","mode":"gentle/standard/deep","timer":{"start":"HH:mm","end":"HH:mm"},"position":{"x":0-100,"y":0-100,"z":0-100}}

联动规则:
0. 默认所有的对话都是通过语音助手进行的（指定了设备除外），如果通过它来操作其他设备，不需要返回内容给语音助手，直接下发操作指令给设备。
1. 如果关闭窗帘，自动打开客厅灯光
2. 如果洗衣机洗衣完成且手动打开了门，自动降下晾衣架。只是洗衣完成并不会做任何操作
3. 睡眠模式：关闭所有灯光，调低空调温度至26度，调到睡眠模式，打开加湿器睡眠模式
4. 离家模式：关闭所有用电设备，锁门，打开安防系统
5. 回家模式：打开玄关灯，新风系统开启，冬季打开地暖，夏季打开空调
6. PM2.5超标时：自动关闭门窗，开启新风系统最大档
7. 下雨天气：自动收起晾衣架，关闭相关窗户
8. 清晨模式：窗帘自动打开，播放轻音乐，打开厨房灯光
9. 烹饪模式：打开厨房灯光，开启新风系统，打开智能水龙头
10. 观影模式：调暗客厅灯光，关闭部分灯光，窗帘关闭到80%
11. 如果不在规则之内，你根据语义进行判断，给出最合理的指令
12. 对于电视，允许设置一个功能：当检测到有人停留在电视 < 1 米超过 10 秒，自动暂停播放并锁定用户的操作，提示用户距离过近，请手动解锁或者远离电视
    如果检测到人离开电视 1 米之外，则自动解锁电视，并恢复播放。
13. 对于家庭机器人（简称机器人），假设可以来操作、管理家里的电器和做一些家务。
    如果机器人要从冰箱拿东西，需要先发送请求给冰箱，再检查冰箱中是否有该食物，如果没有，则机器人不做任何行动，提示用户原因。
    如果食物是生的没有加工的，则提示用户是无法直接食用的，无法执行这个指令。
    如果食物是熟的，则判断是否要微波炉加热，提示用户将先帮助用户加热。
    其他以此类推，按照生活场景情况处理。
    （这部分返回用户的提示语请通过机器人传达回用户，例如：冰箱中没有xxx，无法执行操作  冰箱中的xxx是生的，无法提供给您直接食用）
14. 对于冰箱，假设可以接收指令来刷新冰箱里有哪些食物和食材
在本次示例中，冰箱中的食物和食材情况如下：
  - 猪肉、新鲜里脊肉、冷藏层 2、2024-12-11 入库
  - 牛奶、纯牛奶、冷藏层 1、2024-12-09 入库
  - 酸奶、安慕希原味、冷藏层 1、2024-12-08 入库
  - 生鸡蛋、散装、冷藏层 2、2024-12-07 入库、剩余10个
  - 胡萝卜、新鲜、冷藏层 3、2024-12-05 入库
  - 西兰花、新鲜、冷藏层 3、2024-12-09 入库
  - 啤酒、青岛啤酒、冷藏层 4、2024-12-08 入库、剩余4瓶
  - 面包、欧包、冷藏层 1、2024-12-10 入库
  - 速冻水饺、三全韭菜猪肉、冷冻层 1、2024-12-08 入库
  - 冰淇淋、哈根达斯草莓味、冷冻层 2、2024-12-07 入库
  - 可乐、可口可乐罐装、冷藏层 4、2024-12-07 入库、剩余2瓶
刷新后云端将存储冰箱的食材情况，如果涉及到查找食物场景，先给冰箱刷新数据、再请根据指令（查找、过滤、列出等操作）通过语音助手给用户结果。

返回格式为:
[{}, {}, {}]
每个对象中再加一个属性：ationDescription，使用中文描述执行动作的意图

如果有定时相关的需求，增加额外的字段，设置定时时间，表达式为 currentTime + {after} (after 为秒钟数)
${attentionDistance}

`
  },

  // 冰箱预测性维护场景
  fridge: {
    subTopic: 'fridge/monitor/+',
    pubTopicPrefix: 'demo_down/fridge/maintenance/',
    model: CONFIG.AI_MODEL.FRIDGE,
    systemPrompt: `你是一个冰箱故障诊断专家。请根据以下传感器数据进行故障分析：
- 震动数据 (vibration): 正常范围 0-1.0
- 噪音分贝 (noise): 正常范围 35-45dB
- 压缩机温度 (compressorTemperature): 正常范围 4-80
- 冰箱温度 (fridgeTemperature): 正常范围 -18到4摄氏度
- 门开关状态 (doorStatus): 开/关
- 除霜状态 (defrostStatus): 是/否
- 制冷功率 (coolingPower): 0-100%
- 湿度 (humidity): 30-60%
- 电流 (current): 0.1-10A
- 电压 (voltage): 220V±10%
- 风扇转速 (fanSpeed): 0-3000rpm
- 冷凝器温度 (condenserTemperature): 30-60℃
- 蒸发器温度 (evaporatorTemperature): -30-0℃
- 制冷剂压力 (refrigerantPressure): 0.1-1.0MPa

请分析可能的故障原因和建议的解决方案。返回格式：
{
  "status": "normal/warning/critical",
  "issue": "故障描述",
  "solution": "建议解决方案",
  "urgency": 1-5
}
如果请求中有 调试模式 的字样，除了响应 JSON 之外，还要在 JSON 中添加一个属性：debugMode，值为 true，
并且添加一个属性，指示洗衣机应该主动上报哪些传感器数据、以及每个传感器数据的筛选规则：
- 异常值范围(range: [])，时间范围(分钟，不超过最近 1 小时，timeRange: [])
- 不一定上报全部的数据，请根据故障情况决定要上报的数据。

如果用户只是给出例如 温度过高、有异味、有异响等故障描述，请你根据经验判断可能的故障原因，返回解决方案，并自动启动 debug 模式，从冰箱收集需要的数据。

${attentionDistance}
`
  },

  // 智能穿戴场景
  wearable: {
    subTopic: 'wearable/data/+',
    pubTopicPrefix: 'demo_down/wearable/analysis/',
    model: CONFIG.AI_MODEL.WEARABLE,
    systemPrompt: `你是一个健康数据分析助手。请根据以下数据进行健康状况分析：
- 心率 (heartRate): 正常范围 60-100
- 血氧 (spO2): 正常范围 95-100
- 步数 (steps): 建议每日 8000+
- 睡眠质量 (sleepQuality): 0-100
- 当前运动模式 (运动模式): 步行/跑步/骑行/游泳/瑜伽/其他

请结合数据、运动模式提供健康建议和预警。返回格式：
{
  "healthStatus": "healthy/warning/attention",
  "analysis": "分析结果",
  "suggestions": ["建议1", "建议2"],
  "alert": boolean
}
${attentionDistance}如果是医学内容，在建议后面增加 注意：非医学建议，请谨慎参考。
`
  }
};

// ================ MQTT 客户端 ================

// 创建 MQTT 客户端
const mqttClient = mqtt.connect(MQTT_BROKER, MQTT_OPTIONS);

// ================ 事件处理函数 ================

/**
 * 处理 MQTT 连接成功事件
 */
const handleConnect = () => {
  console.log('已连接到 MQTT Broker');
  // 订阅所有场景的主题
  Object.values(SCENARIOS).forEach(scenario => {
    mqttClient.subscribe(scenario.subTopic);
    console.log('已订阅主题:', scenario.subTopic);
  });
};

/**
 * 调用 AI API
 * @param {string} prompt - 系统提示词
 * @param {string} userInput - 用户输入
 * @param {string} model - AI模型名称
 * @returns {Promise<string>} AI响应
 */
const callAIAPI = async (prompt, userInput, model) => {
  try {
    const response = await axios.post(CONFIG.OPENAI_API_URL, {
      model: model || CONFIG.AI_MODEL.DEFAULT,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userInput }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('调用 AI API 失败:', error.response.data);
    return JSON.stringify({
      msg: '调用 AI 服务失败 - [网络问题]，请重试',
      error: error.message,
      message: error.response.data
    });
  }
};

/**
 * 处理接收到的 MQTT 指令消息
 * 这是模拟设备上报的指令，需要调用 AI 进行处理
 * @param {string} topic - 消息主题
 * @param {Buffer} message - 消息内容
 */
const handleMessage = async (topic, message) => {
  try {
    const payload = message.toString();
    console.log('收到消息:', topic, payload);

    // 确定消息属于哪个场景
    const scenario = Object.values(SCENARIOS).find(s =>
      topic.match(new RegExp(s.subTopic.replace('+', '.*')))
    );

    if (!scenario) {
      console.log('未找到匹配的场景:', topic);
      return;
    }

    // 调用 AI API 获取响应
    const aiResponse = await callAIAPI(scenario.systemPrompt, payload, scenario.model);

    // 发布响应
    const deviceId = topic.split('/').pop(); // 获取主题中的设备ID
    const pubTopic = `${scenario.pubTopicPrefix}${deviceId}`;
    const cleanResponse = aiResponse.replace('```json', '').replace('```', '');
    mqttClient.publish(pubTopic, cleanResponse);
    console.log('已发布响应:', pubTopic, cleanResponse);

  } catch (error) {
    console.error('处理消息时出错:', error);
  }
};

// ================ 事件监听 ================

// 连接 MQTT Broker
mqttClient.on('connect', handleConnect);

// 处理接收到的消息
mqttClient.on('message', handleMessage);

// 错误处理
mqttClient.on('error', (error) => {
  console.error('MQTT 错误:', error);
});

// 进程退出处理
process.on('SIGINT', () => {
  mqttClient.end();
  process.exit();
});
