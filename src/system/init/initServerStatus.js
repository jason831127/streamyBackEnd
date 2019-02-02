module.exports = function (options) {
  return new Promise(function (resolve, reject) {
    if (!options) return reject(new Error('options required'));

    /*
    todo... 實作 server 狀態
    */

    return resolve();
  });
};