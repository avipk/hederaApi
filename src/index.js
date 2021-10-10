import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import config from './config';
import userRouter from './routes/user';
import userDetailsRouter from './routes/userDetails';

/**
 * Call app initialization method.
 */
initApp();

async function initApp() {
  await initMongoDb();
  await initExpressServer();

  console.log('App started');
}

function initExpressServer() {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/user', userRouter);
  app.use('/userDetails', userDetailsRouter);

  const server = app.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Express server ready, on port: ${server.address().port}`);
  });
}

async function initMongoDb() {
  mongoose.connect(process.env.MONGO_CONNECTION_STR).catch(mongoInitialConnectionErrorHandler);

  const { connection } = mongoose;

  connection.on('error', (err) => {
    console.log('Error from mongoDB:', e);
  });

  connection.once('connected', () => {
    console.log('Connection to Hedera-app mongo-db is ready.');
  });
}

function mongoInitialConnectionErrorHandler(err) {
  console.log(e);
}
