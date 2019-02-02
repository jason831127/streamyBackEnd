// 判斷系統目前狀態
module.exports = function(options) {
  if (options.redisReady === true 
    && options.initDataReady === true
  ) {
    options.serverReady = true;
  } else {
    options.serverReady = false;
  }
};