const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());

// Simple request logger (avoid extra deps if possible)
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// API versioning base path
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;


