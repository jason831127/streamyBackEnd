const Server = require('./server');
// 系統的外掛
const RedisSet = require('./system/redis');
const InitSystem = require('./system/init');
// 應用程式
const App = require('./app');

var PORT = 1337;

var server = new Server();
// 掛載 plugin
server.redisSet = new RedisSet(server);
server.initSystem = new InitSystem(server);

const app = App(server);

// exports 出去是為了做 test
// 0.0.0.0 -> 是為了偵聽 ipv4 
module.exports = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port: ${PORT}`);
});
