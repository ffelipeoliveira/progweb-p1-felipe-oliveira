import express from 'express';
import cors from 'cors';
import modelo3DRouter from './routes/modelo3D.js';
import impressaoRouter from './routes/impressao.js';
import materialRouter from './routes/materiais.js';
import impressoraRouter from './routes/impressoras.js';
import embalagemRouter from './routes/embalagens.js';
import vendaRouter from './routes/vendas.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Middleware global (antes das rotas) ---
// Em produção, a origem do front vem da variável CORS_ORIGIN.
const origens = (process.env.CORS_ORIGIN
  ?? 'http://localhost:5500,http://127.0.0.1:5500').split(',');
app.use(cors({ origin: origens }));

app.use(express.json()); // lê o body JSON para req.body
app.use(logger);         // loga toda requisição

// --- Health check ---
app.get('/', (req, res) => {
  res.json({
    api: 'Grafica API',
    versao: '1.0.0',
    rotas: ['/impressoes', '/modelos', '/materiais', '/impressoras', '/embalagens', '/vendas'],
  });
});

// --- Rotas ---
app.use('/impressoes', impressaoRouter);
app.use('/modelos', modelo3DRouter);
app.use('/materiais', materialRouter);
app.use('/impressoras', impressoraRouter);
app.use('/embalagens', embalagemRouter);
app.use('/vendas', vendaRouter);

// --- 404 para rotas que não existem ---
app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.url} não existe` });
});

// --- Tratador de erro: SEMPRE o último ---
app.use(errorHandler);

export default app;
