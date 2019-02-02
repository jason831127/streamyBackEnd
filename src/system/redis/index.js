
const redis = require('ioredis');
const HashRing = require('hashring');

var Redis = function (server, redisConfig) {
  this.server = server;
  this.redis = {};  // Redis Client
  this.initStatus = false; // 尚未跑過起始，用來避免多台 redis client 觸發多次 initSystem

  // 掛載廣播模組
  this.pubMessage = require('./pubMessage.js');
  this.hashRingNode = [];

  // TODO::
  //透過 config 產生 redis client
  // redisConfig = [ { id: 'main', type: 'main', mode: 'normal', host: '127.0.0.1', port: 6379 },
  //    { id: 'sub-main', type: 'main', mode: 'pubsub', host: '127.0.0.1', port: 6379 },
  //    { id: 'online', type: 'online', mode: 'normal', host: '127.0.0.1', port: 6379 },
  //    { id: 'sub-online', type: 'online', mode: 'normal',  host: '127.0.0.1', port: 6379 }]

  redisConfig.forEach((obj) => {
    this.createClient(obj.type, obj.id, obj.mode, obj.host, obj.port);
    // 玩家分流用的
    if (obj.id.startsWith('player')) {
      this.hashRingNode.push(obj.id);
    }
  });

  this.ring = new HashRing(this.hashRingNode);
  // add player to hashRing

  server.attach(this);
};

/**
 * 被 Server 通知有狀態更新了
 * sender: 更新狀態的 plugin
 * args: 更新狀態的參數
 */
Redis.prototype.notify = function (sender, args) {
  // do nothing...
  return { s: sender, a: args};
};

Redis.prototype.createClient = function (type, id, mode, host, port) {
  var self = this;
  var client = new redis({ 
    host: host, 
    port: port, 
    enableReadyCheck: true, 
    retryStrategy: function () { return 2000; }, 
    no_ready_check : true,  //檢查是否真的 Ready
    enable_offline_queue: false,  //關掉 Buffer 
  });

  client.myId = id;
  client.myType = type;

  self.redis[id] = {
    id: id,
    type: type,
    mode: mode,
    client: client        
  };  

  // 發生錯誤
  client.on('error', function (err) {
    logger.error(`[redis ${client.myId} server error]`, err);
    self.checkRedisStatus();
  });

  // 服務發生斷線
  client.on('end', function() {
    logger.error(`[redis ${client.myId} server down]`);
    self.checkRedisStatus();
  });

  if (mode == 'normal') {
    // 連線完成後
    client.on('ready', function () {
      logger.log('[redis ' + this.myId + ' server ready]');
      if (type == 'online') {
        client.config('set', 'notify-keyspace-events', 'Ex', function(err) {
          if (err) {
            //啟動失敗
            logger.log('[redis server set error]', 'AWS Reids 不支援 config command，必須創建一個 Parameter Groups，找到 notify-keyspace-events 填上 Ex  (注意大小寫)，並指定 Redis 使用這個 Parameter Groups', err);
          }
        });
      }
      self.checkRedisStatus();
    });
  } else if (mode == 'pubsub') {
    client.on('message', function (channel, message) {
      logger.log('--- on message ---');
      logger.log('channel:', channel);
      logger.log('message:', message);
      self.server.changeServerStatus(self.server, {
        action: channel,
        message: message
      });
    });

    client.on('pmessage', function (pattern, channel, message) {
      //pattern   :  __key*__:*
      //channel  :  __keyevent@0__:expired
      //message :  test
      logger.log(pattern, channel, message);
      if (pattern === '__key*__:*' && channel === '__keyevent@0__:expired' && message) {
        // 有 redis 的 key 發生過期或消失，就會進到這個事件
        // message = redis 的 key
        var arr = message.split(':');
        if (arr.length == 3 && arr[0] === 'online') {
          // self.server.changeServerStatus(self.server, {
          //   action: 'userOut',
          //   message: arr[1]
          // });
        }
      }
    });

    client.on('ready', function () {
      logger.log('[redis '+this.myId+' server ready]');
      if (id == 'sub-main') {
        client.subscribe('changeSystem');
      } else if (id == 'sub-online') {
        client.psubscribe('__key*__:*', function (err) {
          if (err) {
            //訂閱失敗
            logger.log('[redis sub error]', '訂閱 psubscribe:__key*__:* 發生錯誤', err);
          }
        });  
      } 
      self.checkRedisStatus();
    });
  }
};

Redis.prototype.checkRedisStatus = function () {
  var bln = true;
  for (var id in this.redis) {
    if (this.redis.hasOwnProperty(id)) {
      if (this.redis[id].client.status !== 'ready') {
        bln = false;
        break;
      }
    }
  }
  this.server.redisReady = bln;
  this.server.changeServerStatus(this.server, { });
};

/**
 * 依照 type 取得所有的 client
 * @param {String} type main, online
 */
Redis.prototype.getAllClientByType = function (type) {
  var ary = [];
  for (var id in this.redis) {
    if (this.redis.hasOwnProperty(id)
      && this.redis[id].type == type
      && this.redis[id].client
    ) {
      ary.push(this.redis[id].client);
    }
  }
  return ary;
};

/**
 * 取得所有的 redis client
 */
Redis.prototype.getAllClient = function () {
  var ary = [];
  for (var id in this.redis) {
    ary.push(this.redis[id].client);
  }
  return ary;   // 如果沒有就直接回傳空陣列
};



module.exports = Redis;