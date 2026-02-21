import cors from 'cors';

const origin = process.env.CORS_ORIGIN;
const corsOptions: cors.CorsOptions = {
  origin: origin === undefined || origin === '*' ? true : origin.split(',').map((o) => o.trim()),
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
