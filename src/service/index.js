
const S3Service = require('./s3');


module.exports = function (server) {

  var service = { };
  service.s3 = new S3Service(server);
  return async (ctx, next) => {
    ctx.service = service;
    await next();
  };
};
