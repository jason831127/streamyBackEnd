function Server() {
  let self = this;
  self.serverReady = false;             // Server 服務狀態，false: 關閉服務 true:啟動服務
  // this.serverForceShutdown = false;  // Server 是否強制關閉，false: 不關閉 true:關閉
  self.initDataReady = false;           // 啟動載入記憶體資料狀態，false: 關閉服務 true:啟動服務
  self.modules = [];
  self.ip = '';
  require('dns').lookup(require('os').hostname(), function (err, addr) {
    if (addr) self.ip = addr;
  });
}

Server.prototype.attach = function (plugin) {
  this.modules.push(plugin);
};

Server.prototype.changeServerStatus = function (sender, args) {
  this.serverReady = (this.redisReady === true && this.initDataReady === true);
  this.notifyAll(sender, args);
};

Server.prototype.notifyAll = function (sender, args) {
  for (var i in this.modules) {
    if (typeof this.modules[i].notify === 'function') {
      this.modules[i].notify(sender, args);
    }
  }
};

module.exports = Server;
