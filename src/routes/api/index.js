const Router = require('koa-router');
const ApiError = require('../../lib/ApiError');
const dxid = require('../../lib/dxid');
const token = require('./middleware/token');
const router = new Router();
const validate = require('./middleware/validate');
const Joi = require('joi');
const msgpack = require('msgpack-lite');

const reqInfoValidate = {
  query: {
    appid: Joi.string().required(),
    lang: Joi.string().regex(/^[a-z,A-Z]{0,2}$/).required(),
    os: Joi.string().regex(/[i,a,u,w]/).required(),
    version: Joi.string().required(),
    d: Joi.string().required(),
    countryCode: Joi.string().regex(/^[a-z,A-Z]{0,2}$/).required()
  }
};

router.use(async (ctx, next) => {
  ctx.throwApiError = ApiError.throw;
  ctx.dxid = dxid;
  await next();
});

router.use(async (ctx, next) => {
  await next();
  if (ctx.type == 'image/jpeg') return;
  ctx.model = ctx.model || { };
  ctx.model.code = '200';
  ctx.model.message = ctx.model.message || '';
  ctx.model.d = ctx.query.d;
  ctx.model.p = ctx.path;
  if (ctx.headers && ctx.headers.compression == 'true') {
    let buffer = msgpack.encode(ctx.model);
    ctx.body = Buffer.from(buffer);
  } else { 
    ctx.body = ctx.model;
  }
});

router
  .use(token.parse())
  .use(validate(reqInfoValidate), require('./middleware/reqInfoParser'));

module.exports = router;