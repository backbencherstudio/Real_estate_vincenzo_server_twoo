/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
import cluster from 'cluster';
import os from 'os';
import app from './app';
import config from './app/config';
import mongoose from 'mongoose';

const numCPUs = os.cpus().length; 

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.error(`Worker ${worker.process.pid} exited. Restarting...`);
    cluster.fork();
  });

} else {
  async function main() {
    try {
      await mongoose.connect(config.database_url as string);
      app.listen(config.port, () => {
        console.log(`Worker ${process.pid} is running on PORT === ${config.port}`);
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to start:`, error);
    }
  }

  main();
}
