import 'dotenv/config';
import { PrismaClient, UserRole, ItemCategory, ItemUnit, AllocationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.allocation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Organizations (NGOs)
  const redCross = await prisma.organization.create({
    data: {
      name: 'Red Cross India',
      registrationNo: 'RC-IND-2020-001',
      contactEmail: 'contact@redcross.india.org',
      contactPhone: '+91-11-2345-6789',
      address: '123 Relief Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      isActive: true,
    },
  });

  const careIndia = await prisma.organization.create({
    data: {
      name: 'Care India',
      registrationNo: 'CI-2019-045',
      contactEmail: 'info@careindia.org',
      contactPhone: '+91-11-9876-5432',
      address: '456 Support Avenue',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      isActive: true,
    },
  });

  const oxfamIndia = await prisma.organization.create({
    data: {
      name: 'Oxfam India',
      registrationNo: 'OX-IN-2018-023',
      contactEmail: 'support@oxfamindia.org',
      contactPhone: '+91-80-1234-5678',
      address: '789 Aid Street',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      isActive: true,
    },
  });

  console.log('✅ Created 3 NGO organizations');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Government Users
  const govAdmin = await prisma.user.create({
    data: {
      email: 'admin@gov.in',
      name: 'Government Administrator',
      passwordHash,
      role: UserRole.GOVERNMENT,
      organizationId: null,
    },
  });

  const govCoordinator = await prisma.user.create({
    data: {
      email: 'coordinator@ndma.gov.in',
      name: 'NDMA Coordinator',
      passwordHash,
      role: UserRole.GOVERNMENT,
      organizationId: null,
    },
  });

  // NGO Users
  const redCrossManager = await prisma.user.create({
    data: {
      email: 'manager@redcross.india.org',
      name: 'Rajesh Kumar',
      passwordHash,
      role: UserRole.NGO,
      organizationId: redCross.id,
    },
  });

  const careIndiaManager = await prisma.user.create({
    data: {
      email: 'manager@careindia.org',
      name: 'Priya Sharma',
      passwordHash,
      role: UserRole.NGO,
      organizationId: careIndia.id,
    },
  });

  const oxfamManager = await prisma.user.create({
    data: {
      email: 'manager@oxfamindia.org',
      name: 'Amit Patel',
      passwordHash,
      role: UserRole.NGO,
      organizationId: oxfamIndia.id,
    },
  });

  console.log('✅ Created 5 users (2 Government, 3 NGO)');

  // Create Inventory Items (Relief Supplies)
  const riceItem = await prisma.inventoryItem.create({
    data: {
      name: 'Rice (Basmati)',
      description: 'High-quality basmati rice for disaster relief',
      category: ItemCategory.FOOD,
      unit: ItemUnit.KG,
    },
  });

  const wheatItem = await prisma.inventoryItem.create({
    data: {
      name: 'Wheat Flour',
      description: 'Whole wheat flour',
      category: ItemCategory.FOOD,
      unit: ItemUnit.KG,
    },
  });

  const waterBottles = await prisma.inventoryItem.create({
    data: {
      name: 'Bottled Water (1L)',
      description: 'Purified drinking water bottles',
      category: ItemCategory.WATER,
      unit: ItemUnit.UNIT,
    },
  });

  const firstAidKit = await prisma.inventoryItem.create({
    data: {
      name: 'First Aid Kit',
      description: 'Complete first aid medical kit',
      category: ItemCategory.MEDICINE,
      unit: ItemUnit.UNIT,
    },
  });

  const paracetamol = await prisma.inventoryItem.create({
    data: {
      name: 'Paracetamol Tablets',
      description: 'Pain relief and fever medication',
      category: ItemCategory.MEDICINE,
      unit: ItemUnit.PACKET,
    },
  });

  const blankets = await prisma.inventoryItem.create({
    data: {
      name: 'Winter Blankets',
      description: 'Warm blankets for cold weather',
      category: ItemCategory.SHELTER,
      unit: ItemUnit.UNIT,
    },
  });

  const tents = await prisma.inventoryItem.create({
    data: {
      name: 'Emergency Tents',
      description: 'Waterproof emergency shelter tents',
      category: ItemCategory.SHELTER,
      unit: ItemUnit.UNIT,
    },
  });

  const soapBars = await prisma.inventoryItem.create({
    data: {
      name: 'Soap Bars',
      description: 'Bathing soap bars for hygiene',
      category: ItemCategory.HYGIENE,
      unit: ItemUnit.UNIT,
    },
  });

  console.log('✅ Created 8 inventory items');

  // Create Inventory Records for Organizations
  // Red Cross Inventory
  await prisma.inventory.createMany({
    data: [
      { organizationId: redCross.id, itemId: riceItem.id, quantity: 5000, minThreshold: 1000, maxCapacity: 10000 },
      { organizationId: redCross.id, itemId: waterBottles.id, quantity: 8000, minThreshold: 2000, maxCapacity: 15000 },
      { organizationId: redCross.id, itemId: blankets.id, quantity: 1200, minThreshold: 300, maxCapacity: 3000 },
      { organizationId: redCross.id, itemId: firstAidKit.id, quantity: 450, minThreshold: 100, maxCapacity: 1000 },
    ],
  });

  // Care India Inventory
  await prisma.inventory.createMany({
    data: [
      { organizationId: careIndia.id, itemId: wheatItem.id, quantity: 3000, minThreshold: 800, maxCapacity: 8000 },
      { organizationId: careIndia.id, itemId: waterBottles.id, quantity: 6000, minThreshold: 1500, maxCapacity: 12000 },
      { organizationId: careIndia.id, itemId: paracetamol.id, quantity: 800, minThreshold: 200, maxCapacity: 2000 },
      { organizationId: careIndia.id, itemId: soapBars.id, quantity: 2500, minThreshold: 500, maxCapacity: 5000 },
    ],
  });

  // Oxfam India Inventory
  await prisma.inventory.createMany({
    data: [
      { organizationId: oxfamIndia.id, itemId: riceItem.id, quantity: 2000, minThreshold: 500, maxCapacity: 6000 },
      { organizationId: oxfamIndia.id, itemId: tents.id, quantity: 150, minThreshold: 50, maxCapacity: 500 },
      { organizationId: oxfamIndia.id, itemId: blankets.id, quantity: 800, minThreshold: 200, maxCapacity: 2000 },
      { organizationId: oxfamIndia.id, itemId: firstAidKit.id, quantity: 300, minThreshold: 80, maxCapacity: 800 },
    ],
  });

  console.log('✅ Created 12 inventory records across 3 organizations');

  // Create Allocations (different statuses)
  await prisma.allocation.create({
    data: {
      fromOrgId: redCross.id,
      toOrgId: careIndia.id,
      itemId: waterBottles.id,
      quantity: 500,
      status: AllocationStatus.COMPLETED,
      requestedBy: careIndiaManager.email,
      approvedBy: govAdmin.id,
      requestDate: new Date('2026-01-20'),
      approvedDate: new Date('2026-01-21'),
      completedDate: new Date('2026-01-25'),
      notes: 'Emergency water supply for flood relief in Bihar',
    },
  });

  await prisma.allocation.create({
    data: {
      fromOrgId: redCross.id,
      toOrgId: oxfamIndia.id,
      itemId: blankets.id,
      quantity: 200,
      status: AllocationStatus.IN_TRANSIT,
      requestedBy: oxfamManager.email,
      approvedBy: govCoordinator.id,
      requestDate: new Date('2026-01-26'),
      approvedDate: new Date('2026-01-27'),
      notes: 'Winter relief for mountain regions',
    },
  });

  await prisma.allocation.create({
    data: {
      fromOrgId: careIndia.id,
      toOrgId: oxfamIndia.id,
      itemId: paracetamol.id,
      quantity: 100,
      status: AllocationStatus.APPROVED,
      requestedBy: oxfamManager.email,
      approvedBy: govAdmin.id,
      requestDate: new Date('2026-01-27'),
      approvedDate: new Date('2026-01-28'),
      notes: 'Medical supplies for rural health camps',
    },
  });

  await prisma.allocation.create({
    data: {
      fromOrgId: null,
      toOrgId: redCross.id,
      itemId: riceItem.id,
      quantity: 1000,
      status: AllocationStatus.PENDING,
      requestedBy: redCrossManager.email,
      requestDate: new Date('2026-01-28'),
      notes: 'Restocking request - current stock below threshold',
    },
  });

  await prisma.allocation.create({
    data: {
      fromOrgId: oxfamIndia.id,
      toOrgId: careIndia.id,
      itemId: tents.id,
      quantity: 30,
      status: AllocationStatus.REJECTED,
      requestedBy: careIndiaManager.email,
      approvedBy: govCoordinator.id,
      requestDate: new Date('2026-01-25'),
      approvedDate: new Date('2026-01-26'),
      notes: 'Rejected: Insufficient stock at source organization',
    },
  });

  console.log('✅ Created 5 allocation records with various statuses');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 3 NGO Organizations');
  console.log('  - 5 Users (2 Government, 3 NGO)');
  console.log('  - 8 Relief Item Types');
  console.log('  - 12 Inventory Records');
  console.log('  - 5 Allocation Records\n');
  console.log('🔐 Login Credentials (all passwords: password123):');
  console.log('  Government:');
  console.log('    - admin@gov.in');
  console.log('    - coordinator@ndma.gov.in');
  console.log('  NGOs:');
  console.log('    - manager@redcross.india.org (Red Cross)');
  console.log('    - manager@careindia.org (Care India)');
  console.log('    - manager@oxfamindia.org (Oxfam India)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
