import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import { Server } from 'http';
import seedSuperAdmin from './app/DB';

let server: Server;
async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    seedSuperAdmin();

    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
main();

process.on('unhandledRejection', (reason, promise) => {
  console.error('😡 Unhandled Rejection detected! Shutting down...');
  console.error('Reason:', reason); // error stack or message
  console.error('Promise:', promise); // the promise that was rejected

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', () => {
  console.log('👋 uncaughtException is detected, shutting down...');
  process.exit(1);
});
