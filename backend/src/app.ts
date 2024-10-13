import express from 'express';
import router from './routes/router';
import * as dotenv from 'dotenv';
import cors from 'cors';

import { createServer } from 'http';
import { setupSocketIO } from './server/server';
dotenv.config();

const app = express();
// Create server
const httpServer = createServer(app);
setupSocketIO(httpServer);

// Configure CORS globally
app.use(
  cors({
    origin: '*', // ! allow for portfolio showcase
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // ! allow for portfolio showcase
  }),
);
app.use(express.json()); // ? parse JSON bodies
app.use(express.urlencoded({ extended: true })); // ? allow req.body

app.use('/', router);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});

export default app;
