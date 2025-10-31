import { PrismaClient } from '@prisma/client';
type DealStatus = 'open' | 'won' | 'lost';

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function name(): string {
  const first = ['John', 'Jane', 'Alex', 'Maria', 'Ivan', 'Olga', 'Chen', 'Aiko', 'Sara', 'Leo'];
  const last = ['Smith', 'Johnson', 'Kuznetsov', 'Petrova', 'Garcia', 'Müller', 'Tanaka', 'Lee', 'Rossi', 'Khan'];
  return `${sample(first)} ${sample(last)}`;
}

function companyName(): string {
  const p1 = ['Acme', 'Globex', 'Innotech', 'Stark', 'Wayne', 'Umbrella', 'Soylent', 'Hooli', 'Pied Piper', 'Skynet'];
  const p2 = ['LLC', 'Inc.', 'Group', 'Ltd', 'Corp.', 'PLC'];
  return `${sample(p1)} ${sample(p2)}`;
}

export async function seed() {
  console.log('Seeding demo data...');
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  const companies = await Promise.all(
    Array.from({ length: 8 }).map(() => prisma.company.create({ data: { name: companyName() } }))
  );

  const contacts = await Promise.all(
    Array.from({ length: 30 }).map(() => {
      const [firstName, lastName] = name().split(' ');
      const company = Math.random() < 0.7 ? sample(companies) : null;
      return prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          phone: `+1-555-${randInt(100, 999)}-${randInt(1000, 9999)}`,
          companyId: company?.id
        }
      });
    })
  );

  const now = new Date();
  const deals = [] as any[];
  for (let i = 0; i < 40; i++) {
    const createdAt = new Date(now.getTime() - randInt(0, 150) * 24 * 60 * 60 * 1000);
    const status: DealStatus = Math.random() < 0.4 ? 'won' : Math.random() < 0.5 ? 'lost' : 'open';
    const value = randInt(500, 20000);
    let closedAt: Date | null = null;
    if (status !== 'open') {
      closedAt = new Date(createdAt.getTime() + randInt(3, 60) * 24 * 60 * 60 * 1000);
    }
    const company = Math.random() < 0.8 ? sample(companies) : null;
    const contact = Math.random() < 0.7 ? sample(contacts) : null;
    const title = `Deal #${1000 + i}`;
    const d = await prisma.deal.create({
      data: {
        title,
        value,
        status,
        companyId: company?.id,
        contactId: contact?.id,
        createdAt,
        closedAt
      }
    });
    deals.push(d);
  }

  // Add some tracking events
  const paths = ['/', '/contacts', '/companies', '/deals', '/analytics'];
  for (let i = 0; i < 200; i++) {
    await prisma.trackingEvent.create({
      data: {
        type: 'page_view',
        path: sample(paths),
        userAgent: 'seed-bot/1.0',
        createdAt: new Date(now.getTime() - randInt(0, 6) * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log(`Seeded: ${companies.length} companies, ${contacts.length} contacts, ${deals.length} deals.`);
}

if (process.argv[1]?.includes('seed')) {
  seed().finally(() => prisma.$disconnect());
}
