const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const pino = require('pino')();
const routes = require('./routes');
const metrics = require('./metrics');

const app = express();

// structured logs for each request
app.use(pinoHttp({ logger: pino }));

app.use(helmet());
app.use(express.json());

// metrics middleware: increment counter per route
app.use(metrics.middleware);

// health
app.get('/healthz', async (req, res) => {
  // commit sha from env (set by CI/build)
  const commit = process.env.COMMIT_SHA || null;
  res.json({ status: 'ok', commit });
});

// application routes
app.use('/api/v1', routes);

// metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } catch (err) {
    req.log.error({ err }, 'Failed to get metrics');
    res.status(500).end();
  }
});

module.exports = app;

