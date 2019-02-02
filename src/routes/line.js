const Router = require('koa-router');
const Line = require('../lib/line');

const router = new Router();
var clientId = '1614193886';
var returnUrl = 'http%3A%2F%2Flocalhost%3A1337%2Fline%2Fauth';
var clientSecret = 'ccb966c66e42f56e5d0325306f870fc7';

var line = new Line({ clientId: clientId, clientSecret: clientSecret });

router.get('/auth', async (ctx, next) => {
  var code = ctx.query.code;
  var state = ctx.query.state;

  try {
    var accessToken = await line.getAccessToken(code, returnUrl);
    var userProfile = await line.getUserProfile(accessToken);
    ctx.body = userProfile;
  } catch (error) {
    throw error;
  }
});

router.get('/login', async (ctx) => {
  ctx.redirect(line.getLoginUrl(returnUrl));
});

module.exports = router;