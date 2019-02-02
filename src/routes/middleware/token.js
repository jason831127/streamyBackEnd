var jwt = require('jsonwebtoken');
const SECRET = 'TEST';

// authorization = Bearer {token}
async function verify (authorization, opt) { 
  return new Promise((resolve) => {
    if (!authorization) return resolve(null);
    var bearer = authorization.split(' ');
    if (bearer.length != 2) return resolve(null);
    if (bearer[1] == '' || !bearer[1]) return resolve(null);
    jwt.verify(bearer[1], SECRET, opt, (err, payload) => {
      if (err) throw err;
      else return resolve(payload);
    });
  });
}

async function sign (payload, opt) {
  return new Promise((resolve) => {
    jwt.sign(payload, SECRET, opt, (err, token) => {
      if (err) throw err;
      else return resolve(token);
    });
  });
}

exports.parse = function () { 
  return async (ctx, next) => { 
    try {
      ctx.payload = await verify(ctx.headers.authorization, { ignoreExpiration: true });
      ctx.signToken = sign;
    } catch (err) {
      ctx.throwApiError('400', err.message);
    }
    await next();
  };
};

exports.verify = function(opt) {
  /**
   * huga token 分 2 種, 
   *  1) device huga token : 未登入的 huga token
   *  2) player huga token : 已登入的 huga token
   * 
   * huga token 驗證分4種情境
   * 0: /device/reg 的時候，「可傳」、「可不傳」，但如果有傳，就必須判斷 token 是否過期
   * 1: /auth/refresh - 必須傳，但可以忽略 token.exp (過期時間)
   * 2: 只需要 device huga token, 例如 「建立帳號」 的行為不要登入
   * 3: 登入，可以在登入或非登入狀態
   * 4: 需要 player huga token, 必須是登入狀態 (大部分的 api 都需要)
   */
  opt = opt || { type: 4 };

  return async (ctx, next) => {
    let type = opt.type;
    if (type == 0) {
      // /device/reg
      if (ctx.payload && ctx.payload.exp < parseInt((new Date().getTime() / 1000), 10)) ctx.throwApiError('401', 'Huga token expired');
    } else if (type == 1) {
      // /auth/refresh
      if (!ctx.headers.authorization) ctx.throwApiError('400', 'Missing huga token');
      if (!ctx.payload) ctx.throwApiError('400', 'Missing payload');
    } else if (type == 2) {
      //  /register/create, /forgot/apply
      // /captcha/get, /captcha/img
      if (!ctx.headers.authorization) ctx.throwApiError('400', 'Missing huga token');
      if (!ctx.payload) ctx.throwApiError('400', 'Missing payload');
      if (ctx.payload && ctx.payload.exp < parseInt((new Date().getTime() / 1000), 10)) ctx.throwApiError('401', 'Huga token expired');
      if (ctx.payload.playerId != null) ctx.throwApiError('403', 'Please logout');
    } else if (type == 3) {
      // /auth/login,
      if (!ctx.headers.authorization) ctx.throwApiError('400', 'Missing huga token');
      if (!ctx.payload) ctx.throwApiError('400', 'Missing payload');
      if (ctx.payload && ctx.payload.exp < parseInt((new Date().getTime() / 1000), 10)) ctx.throwApiError('401', 'Huga token expired');
    } else {
      // 其他 必須登入
      if (!ctx.headers.authorization) ctx.throwApiError('400', 'Missing huga token');
      if (!ctx.payload) ctx.throwApiError('400', 'Missing payload');
      if (ctx.payload && ctx.payload.exp < parseInt((new Date().getTime() / 1000), 10)) ctx.throwApiError('401', 'Huga token expired');
      if (ctx.payload.playerId == null) ctx.throwApiError('402', 'Not allow');
    }

    // 如果有 ctx.payload 
    if (ctx.payload) {
      delete ctx.payload.iat;
      delete ctx.payload.exp;
      var newHugaToken = null;
      try {
        newHugaToken = await ctx.signToken(ctx.payload, { expiresIn: ctx.hugaTokenExpiresIn });
      } catch (err) {
        ctx.throwApiError('400', err.message);
      }
      ctx.set('Access-Control-Expose-Headers', 'hugaToken');
      ctx.set('hugaToken', newHugaToken);
    }
    await next();
  };
};
