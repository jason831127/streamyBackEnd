const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Routes = require('./routes');

module.exports = function (server) {
  const app = new Koa();
  app.context.server = server;
  app.use(bodyParser());

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
    console.log('on log ');
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
}

