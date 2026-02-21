import express from 'express';
import { initDatabase, getOrm } from './db';
import { authRouter } from './routes/auth.js';
import { boardsRouter } from './routes/boards.js';
import { listsRouter } from './routes/lists.js';
import { cardsRouter } from './routes/cards.js';
import { commentsRouter } from './routes/comments.js';
import { healthRouter } from './routes/health.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = 3000;

app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/boards', boardsRouter);
app.use('/lists', listsRouter);
app.use('/cards', cardsRouter);
app.use('/comments', commentsRouter);

app.use(notFound);
app.use(errorHandler);

async function main() {
  await initDatabase();
  const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  function shutdown(signal: string) {
    return async () => {
      console.log(`${signal} received, closing server and database...`);
      server.close(() => {
        getOrm()
          .close()
          .then(() => {
            console.log('Database pool closed.');
            process.exit(0);
          })
          .catch((err) => {
            console.error('Error closing database:', err);
            process.exit(1);
          });
      });
    };
  }

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
