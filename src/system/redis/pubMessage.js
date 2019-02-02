// 推送 Redis pub/sub 訊息
var util = require('util');
module.exports = async function (redisClient, channel, message) {
  return new Promise(function(resolve, reject) {
    if (!redisClient) return reject(new Error('請帶入 redisClient'));
    if (!channel) return reject(new Error('請帶入 channel'));
    if (!message) return reject(new Error('請帶入 message'));
    redisClient.publish(channel, util.format(message));
    return resolve();
  });
};