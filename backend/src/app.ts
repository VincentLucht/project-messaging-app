import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import router from './routes/router';
import cors from 'cors';

import { createServer } from 'http';
import { setupSocketIO } from './server/server';

const app = express();
// Create server
const httpServer = createServer(app);
setupSocketIO(httpServer);

const frontendUrl = process.env.FRONTEND_URL;
console.log(frontendUrl);

// Configure CORS globally
app.use(
  cors({
    origin: `${frontendUrl ? frontendUrl : 'http://localhost:3005'}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
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
