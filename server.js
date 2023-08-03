const app = require('./src/app');
const configMongodb = require('./src/configs/config.mongodb');

const PORT = configMongodb.app.port;

const server = app.listen(PORT, () => {
  console.log(`WSV start with port ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log(`Exit Server Express`));
});
