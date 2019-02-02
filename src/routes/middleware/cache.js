
/**
 * { 
 *  redisKey: function(ctx) { }, // Or: ''
 *  reidsId: '',
 *  expire: 10    // 過期秒數
 * }
 */

module.exports = function (option) { 
  option = option || { };
  option.expire = option.expire || 1;
  if (!option.redisId) throw new Error('redisId 必填');

  if (typeof option.redisKey != 'string' && typeof option.redisKey != 'function') return async function (ctx, next) { await next(); };

  return async function (ctx, next) {
    let cacheKey = null; 
    switch (typeof option.redisKey) {
      case 'string': 
        cacheKey = option.redisKey;
        break;
      case 'function':
        cacheKey = option.redisKey(ctx);
        break;
    }
    

    let client = ctx.server.redisSet.redis[option.redisId].client;
    let value = await client.get(cacheKey);
    if (value != null) {
      ctx.model = JSON.parse(value);
    } else {
      await next();
      if (ctx.model)
        await client.setex(cacheKey, option.expire, JSON.stringify(ctx.model));
    }
  };
};