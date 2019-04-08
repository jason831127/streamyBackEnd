global.logger = require('tracer').colorConsole();
const Server = require('./server');
// 系統的外掛
const RedisSet = require('./system/redis');
const InitSystem = require('./system/init');
// 應用程式
const App = require('./app');
//apollo server
const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');






//參數設定 TODO:: productName 跟 phase 要搬去 NODE_ENV 變數中
// let phase = process.env.PHASE || 'docker';

const init = async () => {
  //const config = await require('./lib/remoteConfig')(phase, productName);
  const config = require('../config');
  let PORT = 1337;
  let server = new Server();
  // 掛載 plugin
  server.config = config;
  server.rds = require('knex')(config['rds']);
  console.log(config.rds);
  server.redisSet = new RedisSet(server, config['redis']);
  server.initSystem = new InitSystem(server);

  // const restApp = App(server);
  // // 0.0.0.0 -> 是為了偵聽 ipv4
  // restApp.listen(PORT, '0.0.0.0', () => {
  //   logger.log(`Server listening on port: ${PORT}`);
  // });

  //apollo server
  // Construct a schema, using GraphQL schema language
  // const typeDefs = gql`
  //   type Query {
  //   hello: String
  // }`;

  // // Provide resolver functions for your schema field
  // const resolvers = {
  //   Query: {
  //     hello: () => 'Hello world!',
  //   },
  // };

  // const apolloServer = new ApolloServer({ typeDefs, resolvers });
  const GraphQLSchema = require('./graphql/schema.js')(server);
  const apolloServer = new ApolloServer({  
    schema:GraphQLSchema,
    graphiql: true });

  const app = new Koa();
  apolloServer.applyMiddleware({ app });

  const port = 4000;
  const host = '127.0.0.1';

  app.listen(port, host, () =>
    console.log(`🚀 Server ready at http://${host}:${port}${apolloServer.graphqlPath}`),
  );



};

init()
  .catch((err) => {
    logger.error(err);
  });
