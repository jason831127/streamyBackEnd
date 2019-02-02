const Router = require('koa-router');
const router = new Router();

router.use('/line', require('./line').routes());

router.get('/', async (ctx) => {
  var mainRedis = ctx.server.redisSet.getAllClient()[0];

  var res = await ctx.server.redisSet.pubMessage(mainRedis, 'changeSystem', 'test');

  ctx.body = {
    status: 'success',
    message: 'hello, world!',
    serverReady: ctx.server.serverReady,
    redisReady: ctx.server.redisReady,
    ip: ctx.ip,
    ips: ctx.ips,
    ctx: ctx
  };
});

module.exports = router;