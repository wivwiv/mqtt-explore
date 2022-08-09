use emqx_iot;
-- 设备在线状态表
create table clients (
  `id` bigint(11) auto_increment NOT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`),
  unique key(`clientid`)
);

-- MySQL 动作 SQL
INSERT INTO clients (clientid, username, ip_address, status) VALUES
  (${clientid}, ${username}, ${peername}, 1) ON DUPLICATE KEY UPDATE status = 1 AND ip_address = ${peername};

-- 设备历史事件表
create table client_events (
  `id` bigint(11) auto_increment NOT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `event` char(20) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`)
);

-- INSERT INTO client_events (clientid, event, topic) VALUES
--   ('emqx_c', 'client.connected', '');


-- 设备历史事件表
create table client_events (
  `id` bigint(11) auto_increment NOT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `event` char(20) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`)
);

-- 消息表
create table messages (
  `id` bigint(11) auto_increment NOT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `payload` BLOB DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`)
);

-- 温湿度数据表
create table sensor_data (
  `id` bigint(11) auto_increment NOT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `hum` float(10, 2) DEFAULT 0,
  `temp` float(10, 2) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`)
);

-- MySQL 动作 SQL
INSERT sensor_data(clientid, hum, temp) VALUES(${clientid}, ${temp}, ${hum});

-- Kafka 数据结构
-- { 
-- 	"clientid": "emqx_c",
-- 	"temp": 32.11, 
--     "hum": 72.1 
-- }

-- pkc-lzvrd.us-west4.gcp.confluent.cloud:9092
-- 2KKAX2ZQ6R5F2YM5
-- 2PSv63NbUMDCUIKK7/dipHdJp9KPHaGzOUTHE5aDmByU9STvITEOckpNpq1FfSY+


-- 认证失败、ACL 检查失败记录表
create table auth_acl_failed_logs (
  `id` bigint(11) auto_increment NOT NULL,
  `event` char(20) DEFAULT NULL,
  `clientid` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  primary key (`id`)
);

-- 规则 SQL
-- 认证失败
SELECT
  *
FROM
  "$events/client_connack"
WHERE reason_code = 'unauthorized_client'
-- ACL 检查失败
SELECT
  *
FROM
  "$events/client_check_acl_complete"
WHERE
  result = 'deny' AND is_cache = "false"

-- MySQL 动作 SQL
INSERT auth_acl_failed_logs(event, clientid, ip_address, topic, action) VALUES(${event}, ${clientid}, ${peername}, ${topic}, ${action});




-- 消息丢弃

-- 规则 SQL
SELECT
  *
FROM
  "$events/message_dropped"

-- Redis CMD
HINCRBY demo:message_dropped ${topic}:${reason} 1
