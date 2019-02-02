const Joi = require('joi');
module.exports = function(schema) {
  return async (ctx, next) => {
    let error;
    if (schema.query && !ctx.query) throw new Error('req.query required');
    if (schema.body && !ctx.body) throw new Error('req.body required');
    if (ctx.query && schema.query) {
      let obj = {};
      for (let i in ctx.query) {
        if (schema.query[i]) obj[i] = ctx.query[i];
      }
      error = validateObject(obj, schema.query);
      if (error !== null) throw new Error(error);
    }
    if (ctx.body && schema.body) {
      let obj = {};
      for (let i in ctx.body) {
        if (schema.body[i]) obj[i] = ctx.body[i];
      }
      error = validateObject(obj, schema.query);
      if (error !== null) throw new Error(error);
    }
    await next();
  };
};

function validateObject(object, schema) {
  const result = Joi.validate(object, schema);
  return result.error;
}