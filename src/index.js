const server = require('./server');
const logger = require('pino')();
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

