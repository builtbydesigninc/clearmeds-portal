/**
 * Comprehensive Seed Script for ClearMeds Portal
 * Tests all API endpoints and creates complete test data
 * 
 * Usage: node scripts/seed-data.js
 * 
 * Environment variables:
 * - WP_API_URL or NEXT_PUBLIC_WP_API_URL: WordPress API base URL (e.g., https://yoursite.com/wp-json)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const WP_API_URL = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || 'https://clearmeds.advait.site/wp-json';
const API_BASE = `${WP_API_URL}/clearmeds/v1`;

// Admin credentials for testing admin endpoints and approving users
// WordPress login accepts either username or email
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'advait'; // WordPress admin username
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tashi11314';

// Response log file
const RESPONSES_FILE = path.join(__dirname, 'responses.txt');

// Initialize response log file
function initResponseLog() {
  const timestamp = new Date().toISOString();
  const header = `ClearMeds Portal API Responses Log\nStarted: ${timestamp}\n${'='.repeat(80)}\n\n`;
  fs.writeFileSync(RESPONSES_FILE, header);
}

// Log API response to file
function logResponse(method, endpoint, requestData, response, error = null) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] ${method} ${endpoint}\n`;
  
  if (requestData) {
    logEntry += `Request Data: ${JSON.stringify(requestData, null, 2)}\n`;
  }
  
  if (error) {
    logEntry += `Error: ${error.message}\n`;
    if (error.statusCode) {
      logEntry += `Status Code: ${error.statusCode}\n`;
    }
    if (error.response) {
      logEntry += `Error Response: ${JSON.stringify(error.response, null, 2)}\n`;
    }
  } else if (response) {
    logEntry += `Status Code: ${response.statusCode}\n`;
    logEntry += `Response: ${JSON.stringify(response.data, null, 2)}\n`;
  }
  
  logEntry += `${'-'.repeat(80)}\n\n`;
  
  fs.appendFileSync(RESPONSES_FILE, logEntry);
}

// Store JWT token for authenticated requests
let authToken = '';

// Helper function to make API requests
function apiRequest(method, endpoint, data = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add JWT token if using auth
    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        // Store JWT token from login/register response
        if ((endpoint === '/auth/login' || endpoint === '/auth/register') && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            if (parsed.token) {
              authToken = parsed.token;
            }
          } catch (e) {
            // Ignore parse errors here
          }
        }

        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const response = { data: parsed, statusCode: res.statusCode };
            logResponse(method, endpoint, data, response);
            resolve(response);
          } else {
            const error = new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`);
            error.statusCode = res.statusCode;
            error.response = parsed;
            logResponse(method, endpoint, data, null, error);
            reject(error);
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const response = { data: body, statusCode: res.statusCode };
            logResponse(method, endpoint, data, response);
            resolve(response);
          } else {
            const error = new Error(`API Error: ${res.statusCode} - ${body}`);
            error.statusCode = res.statusCode;
            logResponse(method, endpoint, data, null, error);
            reject(error);
          }
        }
      });
    });

    req.on('error', (error) => {
      logResponse(method, endpoint, data, null, error);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Wait function for delays
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Seed data
async function seedData() {
  // Initialize response log
  initResponseLog();
  console.log('🌱 Starting ClearMeds Portal Comprehensive Seed Script...\n');
  console.log(`API Base URL: ${API_BASE}\n`);
  console.log(`📝 All API responses will be saved to: ${RESPONSES_FILE}\n`);
  console.log('='.repeat(60) + '\n');

  const users = [];
  const testResults = {
    users: { created: 0, existing: 0, failed: 0 },
    commissions: { created: 0, failed: 0 },
    payouts: { created: 0, failed: 0 },
    linkClicks: { created: 0, failed: 0 },
    apiTests: { passed: 0, failed: 0 }
  };

  try {
    // ============================================
    // STEP 1: Create Test Users
    // ============================================
    console.log('📝 STEP 1: Creating Test Users\n');
    
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0101',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        password: 'password123',
        referrerId: null // Root user
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        password: 'password123',
        referrerId: null // Will be set to John's user_id
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '555-0103',
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        password: 'password123',
        referrerId: null // Will be set to John's user_id
      },
      {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        phone: '555-0104',
        address: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        password: 'password123',
        referrerId: null // Will be set to Jane's user_id
      },
      {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@example.com',
        phone: '555-0105',
        address: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        password: 'password123',
        referrerId: null // Will be set to Jane's user_id
      }
    ];

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      
      // Set referrer user_id (not affiliate_id) if not first user
      if (i > 0 && users.length > 0) {
        // Jane and Bob referred by John (user 0)
        // Alice and Charlie referred by Jane (user 1)
        const referrerIndex = i <= 2 ? 0 : 1;
        if (users[referrerIndex]) {
          user.referrerId = users[referrerIndex].userId; // Use user_id, not affiliate_id
        }
      }

      try {
        console.log(`  Attempting to create user: ${user.email}...`);
        if (user.referrerId) {
          console.log(`    With referrer ID: ${user.referrerId}`);
        }
        
        const response = await apiRequest('POST', '/auth/register', user);
        const userData = response.data;
        
        if (!userData.user_id || !userData.affiliate_id) {
          throw new Error('Invalid response: missing user_id or affiliate_id');
        }
        
        const userInfo = {
          ...user,
          userId: userData.user_id,
          affiliateId: userData.affiliate_id
        };
        users.push(userInfo);
        testResults.users.created++;
        console.log(`  ✓ Created user: ${user.firstName} ${user.lastName}`);
        console.log(`    User ID: ${userData.user_id}, Affiliate ID: ${userData.affiliate_id}`);
        if (user.referrerId) {
          const referrer = users.find(u => u.userId === user.referrerId);
          console.log(`    Referred by: ${referrer ? `${referrer.firstName} ${referrer.lastName}` : 'Unknown'}`);
        }
        console.log('');
        
        // Note: New users are set to 'pending' status and cannot login until approved
        // We'll handle approval in a later step if admin user exists
        if (userData.status) {
          console.log(`    Status: ${userData.status}`);
        }
        
        // Login as first user for admin operations (if they're already active)
        if (i === 0) {
          try {
            const loginResponse = await apiRequest('POST', '/auth/login', {
              email: user.email,
              password: user.password
            }, false); // Don't use auth for login itself
            
            if (loginResponse.data.status === 'pending') {
              console.log(`  ⚠ User is pending approval - cannot login yet\n`);
            } else {
              console.log(`  ✓ Logged in as ${user.email} for admin operations\n`);
            }
          } catch (loginError) {
            if (loginError.message && loginError.message.includes('pending')) {
              console.log(`  ⚠ User is pending approval - cannot login until approved\n`);
            } else {
              console.log(`  ⚠ Could not login after registration: ${loginError.message}\n`);
            }
          }
        }
      } catch (error) {
        console.log(`  ✗ Error creating user ${user.email}:`);
        console.log(`    Status: ${error.statusCode || 'N/A'}`);
        console.log(`    Message: ${error.message}`);
        if (error.response) {
          console.log(`    Response: ${JSON.stringify(error.response, null, 2)}`);
        }
        
        if (error.statusCode === 400 && (error.response?.code === 'email_exists' || error.message.includes('already'))) {
          // User exists, try to login and get user info
          try {
            console.log(`  Attempting to login as existing user...`);
            const loginResponse = await apiRequest('POST', '/auth/login', {
              email: user.email,
              password: user.password
            }, false); // Don't use auth for login itself
            
            // Check if user is pending
            if (loginResponse.data.status === 'pending') {
              console.log(`  ⚠ User ${user.email} exists but is pending approval`);
              // Still add to users array for potential approval
              const userInfoObj = {
                ...user,
                userId: loginResponse.data.user_id,
                affiliateId: loginResponse.data.affiliate_id || 'N/A',
                status: 'pending'
              };
              users.push(userInfoObj);
              testResults.users.existing++;
              console.log(`    User ID: ${loginResponse.data.user_id}, Status: pending\n`);
            } else if (loginResponse.data && loginResponse.data.user_id) {
              const userInfoObj = {
                ...user,
                userId: loginResponse.data.user_id,
                affiliateId: loginResponse.data.affiliate_id || 'N/A',
                status: loginResponse.data.status || 'active'
              };
              users.push(userInfoObj);
              testResults.users.existing++;
              console.log(`  ⚠ User ${user.email} already exists, using existing user`);
              console.log(`    User ID: ${loginResponse.data.user_id}, Status: ${userInfoObj.status}, Token received: ${loginResponse.data.token ? 'Yes' : 'No'}\n`);
            } else {
              // Try to get user info with token
              try {
                const userInfo = await apiRequest('GET', '/auth/user', null, true);
                const existingUser = userInfo.data;
                const userInfoObj = {
                  ...user,
                  userId: existingUser.id,
                  affiliateId: existingUser.affiliate_id
                };
                users.push(userInfoObj);
                testResults.users.existing++;
                console.log(`  ⚠ User ${user.email} already exists, using existing user`);
                console.log(`    User ID: ${existingUser.id}, Affiliate ID: ${existingUser.affiliate_id}\n`);
              } catch (userError) {
                // If we have user_id from login, use that
                if (loginResponse.data?.user_id) {
                  const userInfoObj = {
                    ...user,
                    userId: loginResponse.data.user_id,
                    affiliateId: 'N/A'
                  };
                  users.push(userInfoObj);
                  testResults.users.existing++;
                  console.log(`  ⚠ User ${user.email} already exists (using login response)`);
                  console.log(`    User ID: ${loginResponse.data.user_id}\n`);
                } else {
                  throw userError;
                }
              }
            }
          } catch (loginError) {
            testResults.users.failed++;
            console.log(`  ✗ Failed to login as existing user: ${loginError.message}\n`);
          }
        } else {
          testResults.users.failed++;
          console.log('');
        }
      }
    }

    console.log(`✅ User Creation Complete: ${testResults.users.created} created, ${testResults.users.existing} existing, ${testResults.users.failed} failed\n`);
    console.log('='.repeat(60) + '\n');

    if (users.length === 0) {
      throw new Error('No users were created or found. Cannot continue.');
    }

    // ============================================
    // STEP 2: Approve Pending Users (using admin)
    // ============================================
    console.log('✅ STEP 2: Approving Pending Users\n');
    
    // Try to login as admin user
    let adminToken = '';
    try {
      console.log(`  Attempting to login as admin: ${ADMIN_USERNAME}...`);
      const loginResponse = await apiRequest('POST', '/auth/login', {
        email: ADMIN_USERNAME, // WordPress accepts username or email
        password: ADMIN_PASSWORD
      }, false);
      
      if (loginResponse.data.token) {
        adminToken = loginResponse.data.token;
        authToken = adminToken; // Set global token
        console.log(`  ✓ Logged in as admin user\n`);
        
        // Check if user is admin by trying to access admin endpoint
        try {
          await apiRequest('GET', '/admin/dashboard', null, true);
          console.log(`  ✓ Admin privileges confirmed\n`);
          
          // Get pending users
          try {
            const pendingUsersResponse = await apiRequest('GET', '/admin/users?status=pending', null, true);
            const pendingUsers = Array.isArray(pendingUsersResponse.data) ? pendingUsersResponse.data : [];
            
            if (pendingUsers.length > 0) {
              console.log(`  Found ${pendingUsers.length} pending user(s) to approve\n`);
              
              for (const pendingUser of pendingUsers) {
                try {
                  await apiRequest('PUT', `/admin/users/${pendingUser.ID}/approve`, null, true);
                  console.log(`  ✓ Approved user: ${pendingUser.display_name} (${pendingUser.user_email})`);
                  
                  // Update user status in our local array
                  const localUser = users.find(u => u.userId === pendingUser.ID);
                  if (localUser) {
                    localUser.status = 'active';
                  }
                } catch (approveError) {
                  console.log(`  ✗ Failed to approve user ${pendingUser.ID}: ${approveError.message}`);
                }
              }
              console.log('');
            } else {
              console.log(`  No pending users found\n`);
            }
          } catch (usersError) {
            console.log(`  ⚠ Could not fetch pending users: ${usersError.message}\n`);
          }
        } catch (adminError) {
          console.log(`  ⚠ User does not have admin privileges: ${adminError.message}\n`);
        }
      } else {
        console.log(`  ⚠ No token received from admin login\n`);
      }
    } catch (loginError) {
      if (loginError.message && loginError.message.includes('pending')) {
        console.log(`  ⚠ Admin user is pending approval - cannot approve other users\n`);
      } else {
        console.log(`  ⚠ Could not login as admin: ${loginError.message}\n`);
        console.log(`  💡 Tip: Make sure admin credentials are correct\n`);
      }
    }

    // ============================================
    // STEP 3: Test API Endpoints
    // ============================================
    console.log('🧪 STEP 3: Testing API Endpoints\n');

    // Try to login as first user (should work if approved)
    try {
      await apiRequest('POST', '/auth/login', {
        email: users[0].email,
        password: users[0].password
      }, false);
      
      if (authToken) {
        console.log(`  ✓ Authenticated as ${users[0].email}\n`);
      }
    } catch (loginError) {
      if (loginError.message && loginError.message.includes('pending')) {
        console.log(`  ⚠ User is pending approval - skipping API tests\n`);
        console.log(`  💡 Approve users first, then re-run the script\n`);
      } else {
        console.log(`  ⚠ Could not authenticate: ${loginError.message}\n`);
      }
    }

    // Comprehensive user endpoint tests
    const apiTests = [
      // Auth endpoints
      { name: 'Get Current User', endpoint: '/auth/user', method: 'GET' },
      
      // Dashboard
      { name: 'Get Dashboard', endpoint: '/dashboard', method: 'GET' },
      
      // Profile endpoints
      { name: 'Get User Profile', endpoint: '/users/profile', method: 'GET' },
      { name: 'Get Referral Link', endpoint: '/users/referral-link', method: 'GET' },
      { name: 'Get Payment Details', endpoint: '/users/payment-details', method: 'GET' },
      { name: 'Get Tax Info', endpoint: '/users/tax-info', method: 'GET' },
      
      // Referral endpoints
      { name: 'Get Network Full', endpoint: '/referrals/network-full', method: 'GET' },
      { name: 'Get Referral Stats', endpoint: '/referrals/stats', method: 'GET' },
      { name: 'Get Referral Network', endpoint: '/referrals/network', method: 'GET' },
      { name: 'Get Direct Referrals', endpoint: '/referrals/direct', method: 'GET' },
      { name: 'Get Commission Breakdown', endpoint: '/referrals/breakdown', method: 'GET' },
      
      // Transaction endpoints
      { name: 'Get Transactions', endpoint: '/transactions', method: 'GET' },
      
      // Payment endpoints
      { name: 'Get Payments', endpoint: '/payments', method: 'GET' },
      { name: 'Get Payment Methods', endpoint: '/payments/methods', method: 'GET' },
      
      // Leaderboard endpoints
      { name: 'Get Leaderboard', endpoint: '/leaderboard?period=all-time', method: 'GET' },
      { name: 'Get Leaderboard Widget', endpoint: '/leaderboard/widget', method: 'GET' },
      
      // Guides endpoints
      { name: 'Get Guides', endpoint: '/guides', method: 'GET' },
      
      // Marketing endpoints
      { name: 'Get Marketing Links', endpoint: '/marketing/links', method: 'GET' },
      { name: 'Get Marketing Stats', endpoint: '/marketing/stats', method: 'GET' },
      { name: 'Get Marketing Media', endpoint: '/marketing/media', method: 'GET' },
      { name: 'Get Marketing Resources', endpoint: '/marketing/resources', method: 'GET' },
      { name: 'Get Marketing Integrations', endpoint: '/marketing/integrations', method: 'GET' },
    ];

    for (const test of apiTests) {
      try {
        await apiRequest(test.method, test.endpoint, null, true);
        testResults.apiTests.passed++;
        console.log(`  ✓ ${test.name}`);
      } catch (error) {
        testResults.apiTests.failed++;
        console.log(`  ✗ ${test.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ API Tests Complete: ${testResults.apiTests.passed} passed, ${testResults.apiTests.failed} failed\n`);
    console.log('='.repeat(60) + '\n');

    // ============================================
    // STEP 4: Test Profile Updates
    // ============================================
    console.log('📝 STEP 4: Testing Profile Updates\n');

    try {
      const updateData = {
        phone: '555-9999',
        company: 'Test Company',
        bio: 'Updated bio from seed script'
      };
      await apiRequest('PUT', '/users/profile', updateData, true);
      console.log('  ✓ Profile update successful\n');
    } catch (error) {
      console.log(`  ✗ Profile update failed: ${error.message}\n`);
    }

    // Test payment details update
    try {
      const paymentData = {
        method: 'paypal',
        email: users[0].email,
        accountName: `${users[0].firstName} ${users[0].lastName}`
      };
      await apiRequest('PUT', '/users/payment-details', paymentData, true);
      console.log('  ✓ Payment details update successful\n');
    } catch (error) {
      console.log(`  ✗ Payment details update failed: ${error.message}\n`);
    }

    // Test tax info update
    try {
      const taxData = {
        taxIdType: 'ssn',
        taxId: '123-45-6789'
      };
      await apiRequest('PUT', '/users/tax-info', taxData, true);
      console.log('  ✓ Tax info update successful\n');
    } catch (error) {
      console.log(`  ✗ Tax info update failed: ${error.message}\n`);
    }

    // Test add payment method
    try {
      const newPaymentMethod = {
        type: 'bank_account',
        accountName: `${users[0].firstName} ${users[0].lastName}`,
        accountNumber: '****1234',
        bankName: 'Test Bank'
      };
      await apiRequest('POST', '/payments/methods', newPaymentMethod, true);
      console.log('  ✓ Add payment method successful\n');
    } catch (error) {
      console.log(`  ✗ Add payment method failed: ${error.message}\n`);
    }

    // ============================================
    // STEP 5: Test Referral Link Generation
    // ============================================
    console.log('🔗 STEP 5: Testing Referral Link Generation\n');

    try {
      const linkData = await apiRequest('GET', '/users/referral-link', null, true);
      console.log(`  ✓ Referral link: ${linkData.data.referralLink || linkData.data.defaultLink || 'N/A'}\n`);
    } catch (error) {
      console.log(`  ✗ Failed to get referral link: ${error.message}\n`);
    }

    // Test generate marketing link
    try {
      const marketingLinkData = {
        productId: 123,
        utmSource: 'email',
        utmMedium: 'campaign',
        utmCampaign: 'test'
      };
      const generatedLink = await apiRequest('POST', '/marketing/generate-link', marketingLinkData, true);
      console.log(`  ✓ Generated marketing link: ${generatedLink.data.link || 'N/A'}\n`);
    } catch (error) {
      console.log(`  ✗ Failed to generate marketing link: ${error.message}\n`);
    }

    // ============================================
    // STEP 6: Test Admin Endpoints (if admin user exists)
    // ============================================
    console.log('👑 STEP 6: Testing Admin Endpoints\n');

    // Login as admin for admin endpoint tests
    try {
      console.log(`  Logging in as admin for admin endpoint tests...`);
      const adminLoginResponse = await apiRequest('POST', '/auth/login', {
        email: ADMIN_USERNAME, // WordPress accepts username or email
        password: ADMIN_PASSWORD
      }, false);
      
      if (adminLoginResponse.data.token) {
        authToken = adminLoginResponse.data.token;
        console.log(`  ✓ Admin authenticated\n`);
        
        // Test admin dashboard
        try {
          const adminDashboard = await apiRequest('GET', '/admin/dashboard', null, true);
          console.log('  ✓ Admin dashboard accessible');
          console.log(`    Total Affiliates: ${adminDashboard.data.stats?.totalAffiliates || 0}`);
          console.log(`    Active Affiliates: ${adminDashboard.data.stats?.activeAffiliates || 0}`);
          console.log(`    Pending Users: ${adminDashboard.data.stats?.pendingUsers || 0}`);
          console.log(`    Total Sales: $${adminDashboard.data.stats?.totalSales || 0}\n`);
        } catch (error) {
          console.log(`  ✗ Admin dashboard failed: ${error.message}\n`);
        }

        // Test admin endpoints
        const adminTests = [
          { name: 'Get Admin Users', endpoint: '/admin/users', method: 'GET' },
          { name: 'Get Admin Users (Pending)', endpoint: '/admin/users?status=pending', method: 'GET' },
          { name: 'Get Admin Users (Active)', endpoint: '/admin/users?status=active', method: 'GET' },
          { name: 'Get Admin Commissions', endpoint: '/admin/commissions', method: 'GET' },
          { name: 'Get Admin Payouts', endpoint: '/admin/payouts', method: 'GET' },
          { name: 'Get Admin Config', endpoint: '/admin/config', method: 'GET' },
          { name: 'Get Debug Status', endpoint: '/debug/status', method: 'GET' },
        ];

        for (const test of adminTests) {
          try {
            await apiRequest(test.method, test.endpoint, null, true);
            console.log(`  ✓ ${test.name}`);
          } catch (error) {
            console.log(`  ✗ ${test.name}: ${error.message}`);
          }
        }
      } else {
        console.log(`  ⚠ No admin token received\n`);
      }
    } catch (error) {
      console.log(`  ⚠ Could not login as admin: ${error.message}\n`);
    }

    console.log('='.repeat(60) + '\n');

    // ============================================
    // STEP 7: Create Test Commissions and Payouts
    // ============================================
    console.log('💰 STEP 7: Creating Test Commissions and Payouts\n');
    
    // Only create commissions/payouts for active users
    const activeUsers = users.filter(u => u.status === 'active' || !u.status || u.status !== 'pending');
    
    if (activeUsers.length > 0 && authToken) {
      try {
        console.log(`  Creating commissions and payouts for ${activeUsers.length} active user(s)...\n`);
        
        const seedData = {
          users: activeUsers.map(u => ({
            user_id: u.userId,
            email: u.email
          })),
          commissions_per_user: 8,
          payouts_per_user: 3
        };
        
        const seedResponse = await apiRequest('POST', '/admin/seed-data', seedData, true);
        
        if (seedResponse.data.success) {
          const results = seedResponse.data.results;
          testResults.commissions.created = results.commissions.created;
          testResults.commissions.failed = results.commissions.failed;
          testResults.payouts.created = results.payouts.created;
          testResults.payouts.failed = results.payouts.failed;
          
          console.log(`  ✅ Commissions created: ${results.commissions.created}`);
          console.log(`  ✅ Payouts created: ${results.payouts.created}`);
          if (results.commissions.failed > 0) {
            console.log(`  ⚠️  Commissions failed: ${results.commissions.failed}`);
          }
          if (results.payouts.failed > 0) {
            console.log(`  ⚠️  Payouts failed: ${results.payouts.failed}`);
          }
          console.log('');
        } else {
          console.log(`  ⚠️  Seed data creation returned unexpected response\n`);
        }
      } catch (error) {
        console.log(`  ⚠️  Could not create seed data: ${error.message}\n`);
        console.log(`  💡 This is normal if the endpoint doesn't exist yet\n`);
      }
    } else {
      if (activeUsers.length === 0) {
        console.log(`  ⚠️  No active users found. Approve users first to create commissions/payouts\n`);
      } else {
        console.log(`  ⚠️  Not authenticated as admin. Cannot create commissions/payouts\n`);
      }
    }

    console.log('='.repeat(60) + '\n');

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('📊 SEED SCRIPT SUMMARY\n');
    console.log('Users:');
    console.log(`  • Created: ${testResults.users.created}`);
    console.log(`  • Existing: ${testResults.users.existing}`);
    console.log(`  • Failed: ${testResults.users.failed}`);
    console.log(`  • Total: ${users.length}\n`);

    console.log('Commissions:');
    console.log(`  • Created: ${testResults.commissions.created}`);
    console.log(`  • Failed: ${testResults.commissions.failed}\n`);

    console.log('Payouts:');
    console.log(`  • Created: ${testResults.payouts.created}`);
    console.log(`  • Failed: ${testResults.payouts.failed}\n`);

    console.log('API Tests:');
    console.log(`  • Passed: ${testResults.apiTests.passed}`);
    console.log(`  • Failed: ${testResults.apiTests.failed}\n`);

    console.log('Test Users Created:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`     User ID: ${user.userId}, Affiliate ID: ${user.affiliateId}`);
      console.log(`     Status: ${user.status || 'pending'}`);
      if (user.referrerId) {
        const referrer = users.find(u => u.userId === user.referrerId);
        console.log(`     Referred by: ${referrer ? `${referrer.firstName} ${referrer.lastName}` : 'Unknown'}`);
      }
      console.log('');
    });

    console.log('='.repeat(60) + '\n');
    console.log('✅ Seed script completed successfully!\n');
    console.log(`📄 All API responses have been saved to: ${RESPONSES_FILE}\n`);
    console.log('📝 Next Steps:');
    const pendingCount = users.filter(u => u.status === 'pending').length;
    if (pendingCount > 0) {
      console.log(`  1. ⚠ ${pendingCount} user(s) are pending approval`);
      console.log('     - Log in to Next.js admin dashboard');
      console.log('     - Go to Admin > Users');
      console.log('     - Approve pending users');
      console.log('     - Or re-run this script with an admin account\n');
    }
    console.log('  2. Log in to WordPress admin');
    console.log('  3. Go to WooCommerce > Orders');
    console.log('  4. Create test orders with the test users as customers');
    console.log('  5. Set the affiliate ID in order meta: _clearmeds_affiliate_id');
    console.log('  6. Complete the orders to generate commissions');
    console.log('  7. Check the ClearMeds Portal dashboard to see the data');
    console.log('  8. Test the admin panel to approve commissions and process payouts\n');
    
    // Add summary to response log
    const summary = `\n${'='.repeat(80)}\nSEED SCRIPT SUMMARY\n${'='.repeat(80)}\n\n`;
    const summaryData = `Users Created: ${testResults.users.created}\nUsers Existing: ${testResults.users.existing}\nUsers Failed: ${testResults.users.failed}\nCommissions Created: ${testResults.commissions.created}\nCommissions Failed: ${testResults.commissions.failed}\nPayouts Created: ${testResults.payouts.created}\nPayouts Failed: ${testResults.payouts.failed}\nAPI Tests Passed: ${testResults.apiTests.passed}\nAPI Tests Failed: ${testResults.apiTests.failed}\n\nCompleted: ${new Date().toISOString()}\n`;
    fs.appendFileSync(RESPONSES_FILE, summary + summaryData);

  } catch (error) {
    console.error('\n❌ Fatal Error during seeding:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the seed script
if (require.main === module) {
  seedData().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { seedData };
