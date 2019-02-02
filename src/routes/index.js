const Router = require('koa-router');
const router = new Router();
const apiRoutes = require('./api');

router.use('/line', require('./line').routes());

router.get('/serverStatus', async (ctx) => {
  ctx.body = {
    code: '200',
    initDataReady: ctx.server.initDataReady,
    serverReady: ctx.server.serverReady,
    redisReady: ctx.server.redisReady
  };
});

router.use('/api', apiRoutes.routes());

module.exports = router;