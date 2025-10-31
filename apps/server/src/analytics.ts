import { PrismaClient } from '@prisma/client';

export type Overview = {
  companies: number;
  contacts: number;
  deals: number;
  dealsOpen: number;
  dealsWon: number;
  dealsLost: number;
  revenueTotal: number;
  avgDealValue: number;
  avgDaysToClose: number | null;
  conversionRate: number; // 0..1
};

export async function getOverview(prisma: PrismaClient): Promise<Overview> {
  const [companies, contacts, deals, dealsOpen, dealsWon, dealsLost] = await Promise.all([
    prisma.company.count(),
    prisma.contact.count(),
    prisma.deal.count(),
    prisma.deal.count({ where: { status: 'open' } }),
    prisma.deal.count({ where: { status: 'won' } }),
    prisma.deal.count({ where: { status: 'lost' } })
  ]);

  const wonDeals = await prisma.deal.findMany({
    where: { status: 'won' },
    select: { value: true, createdAt: true, closedAt: true }
  });
  const revenueTotal = wonDeals.reduce((sum: number, d: { value: number | null }) => sum + (d.value || 0), 0);
  const avgDealValue = dealsWon ? revenueTotal / dealsWon : 0;

  const cycleDurations = wonDeals
    .filter((d: { closedAt: Date | null }) => d.closedAt)
    .map((d: { closedAt: Date | null; createdAt: Date }) => (d.closedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const avgDaysToClose = cycleDurations.length
    ? cycleDurations.reduce((a: number, b: number) => a + b, 0) / cycleDurations.length
    : null;

  const conversionRate = dealsWon + dealsLost > 0 ? dealsWon / (dealsWon + dealsLost) : 0;

  return {
    companies,
    contacts,
    deals,
    dealsOpen,
    dealsWon,
    dealsLost,
    revenueTotal,
    avgDealValue,
    avgDaysToClose,
    conversionRate
  };
}

export type RevenuePoint = { month: string; revenue: number };

export async function getRevenueMonthly(prisma: PrismaClient, months = 6): Promise<RevenuePoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const deals = await prisma.deal.findMany({
    where: { status: 'won', closedAt: { not: null, gte: since } },
    select: { value: true, closedAt: true }
  });

  const points = new Map<string, number>();
  const cursor = new Date(since);
  for (let i = 0; i < months; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    points.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const d of deals) {
    if (!d.closedAt) continue;
    const key = `${d.closedAt.getFullYear()}-${String(d.closedAt.getMonth() + 1).padStart(2, '0')}`;
    points.set(key, (points.get(key) || 0) + (d.value || 0));
  }

  return Array.from(points.entries()).map(([month, revenue]) => ({ month, revenue }));
}

export type TopCompany = { companyId: string; name: string; revenue: number };

export async function getTopCompanies(prisma: PrismaClient, limit = 10): Promise<TopCompany[]> {
  const won = await prisma.deal.findMany({ where: { status: 'won' }, select: { value: true, companyId: true } });
  const byCompany = new Map<string, number>();
  for (const d of won) {
    if (!d.companyId) continue;
    byCompany.set(d.companyId, (byCompany.get(d.companyId) || 0) + (d.value || 0));
  }
  const entries = Array.from(byCompany.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
  const companies = await prisma.company.findMany({ where: { id: { in: entries.map(([id]) => id) } } });
  const nameById = new Map<string, string>(companies.map((c: { id: string; name: string }) => [c.id, c.name] as const));
  return entries.map(([id, revenue]) => ({ companyId: id, name: nameById.get(id) ?? 'Unknown', revenue }));
}

export type EventsSummary = { day: string; events: number }[];

export async function getEventsSummary(prisma: PrismaClient, days = 7): Promise<EventsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await prisma.trackingEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const out = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, events]) => ({ day, events }));
  return out;
}
