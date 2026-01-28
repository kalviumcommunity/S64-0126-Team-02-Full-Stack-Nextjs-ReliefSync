import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function testQueries() {
  try {
    console.log('🔌 Testing Prisma Client Connection & Queries\n');
    
    // Test 1: Get all users
    console.log('📋 Test 1: Getting all users...');
    const users = await prisma.user.findMany({
      include: { organization: true }
    });
    console.log(`✅ Successfully retrieved ${users.length} users`);
    console.log('Sample user:', JSON.stringify(users[0], null, 2));
    console.log('');
    
    // Test 2: Get all organizations
    console.log('🏢 Test 2: Getting all organizations...');
    const orgs = await prisma.organization.findMany({
      include: { 
        _count: {
          select: { users: true }
        }
      }
    });
    console.log(`✅ Successfully retrieved ${orgs.length} organizations`);
    console.log('Sample org:', JSON.stringify(orgs[0], null, 2));
    console.log('');
    
    // Test 3: Get allocations by status
    console.log('📦 Test 3: Getting allocations by status...');
    const allocations = await prisma.allocation.findMany({
      include: {
        fromOrg: true,
        toOrg: true
      }
    });
    console.log(`✅ Successfully retrieved ${allocations.length} allocations`);
    console.log('Sample allocation:', JSON.stringify(allocations[0], null, 2));
    console.log('');
    
    // Test 4: Count queries
    console.log('📊 Test 4: Getting count statistics...');
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    const allocationCount = await prisma.allocation.count();
    
    console.log(`✅ Database Statistics:`);
    console.log(`   - Total Users: ${userCount}`);
    console.log(`   - Total Organizations: ${orgCount}`);
    console.log(`   - Total Allocations: ${allocationCount}`);
    console.log('');
    
    console.log('✨ All tests passed! Prisma client is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testQueries();
