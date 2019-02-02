global.logger = require('tracer').colorConsole();
const Server = require('./server');
// 系統的外掛
const RedisSet = require('./system/redis');
const InitSystem = require('./system/init');
// 應用程式
const App = require('./app');
// console 中控台 的 library
const HpsConsole = require('./lib/console/HpsConsole');

//參數設定 TODO:: productName 跟 phase 要搬去 NODE_ENV 變數中
// let phase = process.env.PHASE || 'docker';
// let productName = 'hps-platform';

const init = async () => {
  //const config = await require('./lib/remoteConfig')(phase, productName);
  const config = require('./config');
  let PORT = 1337;
  let server = new Server();
  // 掛載 plugin
  server.config = config;
  server.rds = require('knex')(config['hps-platform-rds']);
  server.redisSet = new RedisSet(server, config['hps-platform-redis']);
  server.initSystem = new InitSystem(server);
  server.console = new HpsConsole(config.consoleConfig);

  const app = App(server);
  // 0.0.0.0 -> 是為了偵聽 ipv4
  app.listen(PORT, '0.0.0.0', () => {
    logger.log(`Server listening on port: ${PORT}`);
  });

};

init()
  .catch((err)=>{
    logger.error(err);
  });
