import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { config as loadEnv } from 'dotenv';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import { getOverview, getRevenueMonthly, getTopCompanies, getEventsSummary } from './analytics';

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const YJS_PATH = process.env.YJS_PATH || '/yjs';
const DEFAULT_ROOM = process.env.YJS_ROOM || 'crm';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(helmet, { contentSecurityPolicy: false });

app.get('/healthz', async () => ({ ok: true }));

// Basic REST endpoints (minimal demo)
app.get('/api/contacts', async () => {
  return prisma.contact.findMany();
});

app.post('/api/contacts', async (req, reply) => {
  const body = req.body as any;
  const created = await prisma.contact.create({ data: body });
  reply.code(201);
  return created;
});

app.get('/api/companies', async () => prisma.company.findMany());
app.post('/api/companies', async (req, reply) => {
  const created = await prisma.company.create({ data: req.body as any });
  reply.code(201);
  return created;
});

app.get('/api/deals', async () => prisma.deal.findMany());
app.post('/api/deals', async (req, reply) => {
  const created = await prisma.deal.create({ data: req.body as any });
  reply.code(201);
  return created;
});

// Tracking events ingestion
app.post('/api/events', async (req, reply) => {
  const ua = (req.headers['user-agent'] as string) || undefined;
  const { type = 'event', path, meta } = (req.body as any) || {};
  await prisma.trackingEvent.create({ data: { type, path, meta, userAgent: ua } });
  reply.code(204);
});

// Analytics endpoints
app.get('/api/analytics/overview', async () => getOverview(prisma));
app.get('/api/analytics/revenue-monthly', async () => getRevenueMonthly(prisma, 6));
app.get('/api/analytics/top-companies', async () => getTopCompanies(prisma, 10));
app.get('/api/analytics/events-summary', async () => getEventsSummary(prisma, 7));

// Start server and attach y-websocket
const start = async () => {
  try {
    await app.listen({ host: '0.0.0.0', port: PORT });

    const server = app.server; // Node HTTP server
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket, head) => {
      const url = request.url || '/';
      if (!url.startsWith(YJS_PATH)) return;

      wss.handleUpgrade(request, socket as any, head, (ws: any) => {
        let room = DEFAULT_ROOM;
        try {
          const u = new URL(url, 'http://localhost');
          room = u.searchParams.get('room') || DEFAULT_ROOM;
        } catch {}
        setupWSConnection(ws as any, request, { docName: room });
      });
    });

    app.log.info(`HTTP listening on :${PORT}`);
    app.log.info(`y-websocket at ${YJS_PATH}?room=<room>`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
