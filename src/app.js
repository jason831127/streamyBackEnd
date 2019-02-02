const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Routes = require('./routes');
const Service = require('./service');
require('power-string-number');

module.exports = function (server) {
  const app = new Koa();
  app.context.server = server;
  app.use(bodyParser({ jsonLimit: '100mb', formLimit: '100mb' }));
  app.use(Service(server));

  // Error Handling = Express app.use(function (err, req, res, next) { });
  app.use(async (ctx, next) => {
    try { 
      await next();
      ctx.app.emit('log', ctx);
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
  });

  app.use(Routes.routes());

  app.on('log', ctx => {
    let logFormat = logMessage(ctx, 'apiLog');
    ctx.console.api.log(JSON.stringify(logFormat));
  });

  // Error Handling
  app.on('error', (err, ctx) => {
    /* centralized error handling:
    *   console.log error
    *   write error to log file
    *   save error and request information to database if ctx.request match condition
    */
    console.log('ctx', ctx.request.path);
    console.log('server error', err);
  });

  return app;
};

function logMessage (ctx, logName, err) {
  return {
    logName: logName,
    time: new Date().toISOString(),
    phase: process.env.PHASE,
    payload: ctx.payload || null,
    method: ctx.request.method,
    path: ctx.request.path,
    query: ctx.request.query,
    body: ctx.request.body,
    authorization: ctx.headers ? (ctx.headers.authorization || null) : null,
    // model 的資料量太大，先不建 index
    // model: ctx.model,
    modelStr: ctx.model ? JSON.stringify(ctx.model): '',
    errMessage: err ? err.message : '',
    err: err || null,
  };
}
