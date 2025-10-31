import { PrismaClient } from '@prisma/client';
import { getOverview, getRevenueMonthly, getTopCompanies, getEventsSummary } from './analytics';
import { seed } from './seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Running analytics test...');
  await seed();
  const overview = await getOverview(prisma);
  const revenue = await getRevenueMonthly(prisma, 6);
  const top = await getTopCompanies(prisma, 5);
  const events = await getEventsSummary(prisma, 7);

  console.log('\nOverview:');
  console.table(overview as any);

  console.log('\nRevenue (last 6 months):');
  console.table(revenue);

  console.log('\nTop Companies by Revenue:');
  console.table(top);

  console.log('\nEvents last 7 days:');
  console.table(events);
}

main().finally(() => prisma.$disconnect());

