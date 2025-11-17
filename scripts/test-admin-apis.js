/**
 * Test script for Admin APIs
 * Tests users, commissions, and payouts endpoints
 * 
 * Usage: node scripts/test-admin-apis.js
 */

const API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || process.env.WP_API_URL 
  ? `${process.env.NEXT_PUBLIC_WP_API_URL || process.env.WP_API_URL}/clearmeds/v1`
  : 'https://clearmeds.advait.site/wp-json/clearmeds/v1';

// You'll need to set these from your actual login
const TEST_EMAIL = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'advait';
const TEST_PASSWORD = process.env.TEST_PASSWORD || process.env.ADMIN_PASSWORD || 'tashi11314';

console.log('API Base URL:', API_BASE);
console.log('Test Email:', TEST_EMAIL);
console.log('');

async function testAPIs() {
  console.log('🔍 Testing Admin APIs...\n');

  // Step 1: Login to get token
  console.log('1. Logging in...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    if (!token) {
      console.error('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful');
    console.log('   Role:', loginData.role);
    console.log('   Token:', token.substring(0, 20) + '...\n');

    // Step 2: Test Get Admin Users
    console.log('2. Testing GET /admin/users...');
    try {
      const usersResponse = await fetch(`${API_BASE}/admin/users?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('   Status:', usersResponse.status);
      const usersData = await usersResponse.json();
      console.log('   Response type:', Array.isArray(usersData) ? 'Array' : typeof usersData);
      console.log('   Response length:', Array.isArray(usersData) ? usersData.length : 'N/A');
      
      if (Array.isArray(usersData) && usersData.length > 0) {
        console.log('   ✅ Users found:', usersData.length);
        console.log('   First user:', JSON.stringify(usersData[0], null, 2));
      } else {
        console.log('   ⚠️  No users returned or empty array');
        console.log('   Full response:', JSON.stringify(usersData, null, 2));
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }

    console.log('\n3. Testing GET /admin/commissions...');
    try {
      const commissionsResponse = await fetch(`${API_BASE}/admin/commissions?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('   Status:', commissionsResponse.status);
      const commissionsData = await commissionsResponse.json();
      console.log('   Response type:', Array.isArray(commissionsData) ? 'Array' : typeof commissionsData);
      console.log('   Response length:', Array.isArray(commissionsData) ? commissionsData.length : 'N/A');
      
      if (Array.isArray(commissionsData) && commissionsData.length > 0) {
        console.log('   ✅ Commissions found:', commissionsData.length);
        console.log('   First commission:', JSON.stringify(commissionsData[0], null, 2));
      } else {
        console.log('   ⚠️  No commissions returned or empty array');
        console.log('   Full response:', JSON.stringify(commissionsData, null, 2));
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }

    console.log('\n4. Testing GET /admin/payouts...');
    try {
      const payoutsResponse = await fetch(`${API_BASE}/admin/payouts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('   Status:', payoutsResponse.status);
      const payoutsData = await payoutsResponse.json();
      console.log('   Response type:', Array.isArray(payoutsData) ? 'Array' : typeof payoutsData);
      console.log('   Response length:', Array.isArray(payoutsData) ? payoutsData.length : 'N/A');
      
      if (Array.isArray(payoutsData) && payoutsData.length > 0) {
        console.log('   ✅ Payouts found:', payoutsData.length);
        console.log('   First payout:', JSON.stringify(payoutsData[0], null, 2));
      } else {
        console.log('   ⚠️  No payouts returned or empty array');
        console.log('   Full response:', JSON.stringify(payoutsData, null, 2));
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }

    console.log('\n5. Testing GET /admin/dashboard...');
    try {
      const dashboardResponse = await fetch(`${API_BASE}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('   Status:', dashboardResponse.status);
      const dashboardData = await dashboardResponse.json();
      console.log('   Response:', JSON.stringify(dashboardData, null, 2));
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
testAPIs().catch(console.error);

