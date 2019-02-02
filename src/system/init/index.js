// 處理系統開機時載入系統相關起始資訊
function Init(server) {
  this.tasks = [];
  this.server = server;
  this.isFirstTime = true;

  if (this.isFirstTime) {
    // 第一次載入的時候，要做的工作請放在這
    this.tasks.push(require('./initServerStatus'));
  } else { 
    this.tasks.push(require('./initServerStatus'));
  }

  this.server.attach(this);
};

Init.prototype.do = function () {
  var self = this;
  if (self.server.redisReady === false) return;
  if (self.server.initDataReady === true) return;
  Promise.all(this.tasks)
    .then(function () {
      self.server.initDataReady = true;
      self.isFirstTime = false;
      self.server.changeServerStatus(self, { });
      self.notify(self, { });
    })
    .catch(function (err) {
      console.log(err);
      self.server.initDataReady = false;
      self.server.changeServerStatus(self, { });
      self.notify(self, { });
      // 等 1 秒後再次載入=
      setTimeout(function() {
        self.do();
      }, 1000);
    });
};

/**
 * 被 Server 通知有狀態更新了
 * sender: 更新狀態的 plugin
 * args: 更新狀態的參數
 */
Init.prototype.notify = function (sender, args) {
  var self = this;

  if (args && args.action && args.action == 'changeSystem') {
    self.update(args.message);
  } else {
    self.do();
  }
};

/**
 * 更新系統的環境變數請放這裏
 */
Init.prototype.update = function (message) {
  var ary1 = [];
  var ary2 = [];
  switch (message) {
    case 'rand':
      // 更新 rand 遊戲機率、比倍機率
      // ary1.push(require('./initGameList.js')(options));
      // ary2.push(require('./initRand.js')(options));
      break;
  }

  if (ary1.length > 0) {
    Promise.all(ary1)
      .then(function() {
        if (ary2.length == 0) return;
        return Promise.all(ary2);
      })
      .then(function() {
        console.log('[system.getMessage] finish');
      })
      .catch(function (err) {
        console.error('[getMessage error]', {channel: channel, message: message}, err);
      });
  }


}

module.exports = Init;