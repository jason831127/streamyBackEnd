/**
 * Client 每次呼叫 api 都會傳的 query string 
 * 會將 query 轉換成 ctx.reqInfo
 * 如果沒有帶，會回傳錯誤
 * ref: https://docs.google.com/document/d/1WmwF-m_4jOlgupZEFuu-0eXR6ldRfza2asQQ-9GUc8c/edit#
 */
const osEnums = [ 'i', 'a', 'u', 'w' ];
module.exports = async function (ctx, next) {
  if (!ctx.request.query) ctx.throwApiError('reqInfoError.000', 'req info query string required');
  if (!ctx.request.query.appid) ctx.throwApiError('reqInfoError.001', 'appid required');
  if (!ctx.request.query.lang) ctx.throwApiError('reqInfoError.002', 'lang required');
  if (!ctx.request.query.os) ctx.throwApiError('reqInfoError.003', 'os required');
  else if (osEnums.indexOf(ctx.request.query.os) == -1) ctx.throwApiError('reqInfoError.003.1', 'wrong os type, must be i,a,u,w');
  if (!ctx.request.query.version) ctx.throwApiError('reqInfoError.004', 'version required');
  if (!ctx.request.query.d) ctx.throwApiError('reqInfoError.005', 'd required');
  ctx.reqInfo = {
    appId: ctx.request.query.appid,
    lang: ctx.request.query.lang,
    os: ctx.request.query.os,
    version: ctx.query.version,
    d: ctx.query.d,
    countryCode: ctx.query.countryCode || 'UNKNOW'
  };
  await next();
};
