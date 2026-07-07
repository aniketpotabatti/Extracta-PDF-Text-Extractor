import express from 'express';
import cors from 'cors';
import pdfRouter from './routes/pdf.routes';
import { PUBLIC_DIR } from './config';

const app = express();
const PORT = process.env.PORT ?? 3000;

// TODO: Restrict CORS origins before deploying to production.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(PUBLIC_DIR));
app.use('/api/pdf', pdfRouter);

// Catch-all: serve the SPA for any non-API route (Express 5 wildcard syntax).
app.get('/{*path}', (_req, res) => {
  res.sendFile(`${PUBLIC_DIR}/index.html`);
});

app.listen(PORT, () => {
  console.log(`\n✨ Extracta is running at http://localhost:${PORT}\n`);
});

export default app;

