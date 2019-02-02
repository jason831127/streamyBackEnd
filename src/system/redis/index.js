
var redis = require('ioredis');

var Redis = function (server) {
  this.server = server;
  this.redis = {};  // Redis Client
  this.initStatus = false; // 尚未跑過起始，用來避免多台 redis client 觸發多次 initSystem

  // 掛載廣播模組
  this.pubMessage = require('./pubMessage.js');

  // todo ...
  this.createClient('main', 'main', '127.0.0.1', 6379);
  this.createClient('sub-main', 'sub-main', '127.0.0.1', 6379);

  server.attach(this);
};

/**
 * 被 Server 通知有狀態更新了
 * sender: 更新狀態的 plugin
 * args: 更新狀態的參數
 */
Redis.prototype.notify = function (sender, args) {
  // do nothing...
};

Redis.prototype.createClient = function (type, id, host, port) {
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
    type: type,
    id: id,
    client: client        
  };  

  // 發生錯誤
  client.on('error', function (err) {
    console.error(`[redis ${client.myId} server error]`);
    self.checkRedisStatus();
  });

  // 服務發生斷線
  client.on('end', function() {
    console.error(`[redis ${client.myId} server down]`, err);
    self.checkRedisStatus();
  });

  if (type == 'player' || type == 'main') {
    // 連線完成後
    client.on('ready', function () {
      console.log('[redis '+this.myId+' server ready]');
      self.checkRedisStatus();
    });
  } else if (type == 'sub-main' || type == 'sub-player') {
    
    client.on('message', function (channel, message) {
      console.log('--- on message ---');
      console.log('channel:', channel);
      console.log('message:', message);
      self.server.changeServerStatus(self.server, {
        action: channel,
        message: message
      });
    });

    client.on('pmessage', function (pattern, channel, message) {
      //pattern   :  __key*__:*
      //channel  :  __keyevent@0__:expired
      //message :  test
      console.log(pattern, channel, message);
      if (pattern === '__key*__:*' && channel === '__keyevent@0__:expired' && message) {
        // 有 redis 的 key 發生過期或消失，就會進到這個事件
        // message = redis 的 key
      }
    });

    client.on('ready', function () {
      console.log('[redis '+this.myId+' server ready]');
      if (type == 'sub-main') {
        client.subscribe('changeSystem');
      } else if (type == 'sub-player') {
        client.psubscribe('__key*__:*', function (err) {
          if (err) {
            //訂閱失敗
            console.log('[redis sub error]', '訂閱 psubscribe:__key*__:* 發生錯誤', err);
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
}

/**
 * 依照 type 取得所有的 client
 * @param {String} type player, main
 */
Redis.prototype.getAllClientByType = function (type) {
  var ary = [];
  for (var id in this.redis) {
    if (this.redis.hasOwnProperty(id)
      && this.redis[id].type == type
      && this.redis[id].client
      && this.redis[id].client.connected
    ) {
      ary.push(this.redis[id].client);
    }
  }
  return ary;
}

/**
 * 取得所有的 redis client
 */
Redis.prototype.getAllClient = function () {
  var ary = [];
  for (var id in this.redis) {
    ary.push(this.redis[id].client);
  }
  return ary;   // 如果沒有就直接回傳空陣列
}

module.exports = Redis;