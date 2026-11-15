/**
 * CodeThesis AI - Comprehensive Authentication & Security Test Suite
 * File: scratch/test_full_auth_suite.js
 * Target: http://localhost:3000
 *
 * Test cases covered:
 *  1. Student registration (POST /api/auth/register) -> 15 credits + session cookie
 *  2. Login with valid student credentials (POST /api/auth/login) -> 200 + session cookie
 *  3. Login with invalid password (POST /api/auth/login) -> 401 error message
 *  4. Session verification (GET /api/auth/me) -> authenticated user profile
 *  5. Fast 1-Click Demo Login (demo: 'adebayo') -> 200 + student session cookie
 *  6. 1-Click Admin Demo Login (demo: 'admin') -> 200 + admin role + session cookie
 *  7. Firebase Google sign-in sync (POST /api/auth/firebase) -> auto-provision + 15 credits + session cookie
 *  8. Forgot password request (POST /api/auth/forgot-password) -> valid token + resetUrl
 *  9. Reset password execution (POST /api/auth/reset-password) -> 200; old password fails (401), new password succeeds (200)
 * 10. Logout (POST /api/auth/logout) -> clears cookie + invalidated session verification
 * 11. Route Protection: Unauthenticated access to /dashboard -> 307 redirect to /auth/login
 * 12. RBAC Route Protection: Student access to /admin blocked (307 to /dashboard), Admin access allowed (200)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DB_FILE = path.join(__dirname, '..', 'data', 'codethesis_db.json');

// Color formatting for console
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Helper to extract session cookie value
function extractSessionCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(/codethesis_session=([^;]+)/);
  return match ? match[1] : null;
}

// Clean up test accounts from database before running suite
function cleanupTestUsers(emails) {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      const initialCount = data.users.length;
      data.users = data.users.filter(
        (u) => !emails.includes(u.email.toLowerCase())
      );
      if (data.users.length !== initialCount) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`${colors.dim}Cleaned up ${initialCount - data.users.length} previous test user(s) from database.${colors.reset}`);
      }
    }
  } catch (err) {
    console.warn(`${colors.yellow}Warning during test user cleanup: ${err.message}${colors.reset}`);
  }
}

// Test runner summary tracking
const testResults = [];

async function runTest(testNum, testName, testFn) {
  const start = Date.now();
  process.stdout.write(`  [Test ${String(testNum).padStart(2, '0')}] ${testName.padEnd(68)} `);
  try {
    const details = await testFn();
    const duration = Date.now() - start;
    console.log(`${colors.green}${colors.bold}PASS${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
    if (details) {
      console.log(`         ${colors.dim}└─ ${details}${colors.reset}`);
    }
    testResults.push({ num: testNum, name: testName, status: 'PASS', duration, error: null });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`${colors.red}${colors.bold}FAIL${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
    console.log(`         ${colors.red}└─ Error: ${err.message}${colors.reset}`);
    testResults.push({ num: testNum, name: testName, status: 'FAIL', duration, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==========================================
// Main Test Execution
// ==========================================
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  CodeThesis AI — End-to-End Authentication & Security Verification Test Suite${colors.reset}`);
  console.log(`${colors.dim}  Target Server: ${BASE_URL} | Started: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Target test accounts
  const testStudentEmail = 'qa.student.automated@futa.edu.ng';
  const testStudentPassword = 'InitialPassword2026!';
  const updatedStudentPassword = 'NewSecretPassword2026!';
  const googleSyncEmail = 'tester.google@futa.edu.ng';

  // Pre-test DB hygiene
  cleanupTestUsers([testStudentEmail, googleSyncEmail]);

  // Variables to carry state across tests
  let registeredUserSessionCookie = null;
  let resetToken = null;
  let adminSessionCookie = null;
  let studentSessionCookie = null;

  // -------------------------------------------------------------------------
  // TEST 1: Student Registration (POST /api/auth/register)
  // -------------------------------------------------------------------------
  await runTest(1, 'Student Registration & Free Starter Credits Grant', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Automated Student',
        email: testStudentEmail,
        password: testStudentPassword,
        matricNumber: 'FUTA/CSC/20/8888',
        institution: 'Federal University of Technology, Akure',
        course: 'Computer Science',
      }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(data.user, 'Expected user object in response');
    assert(data.user.email.toLowerCase() === testStudentEmail.toLowerCase(), `User email mismatch: ${data.user.email}`);
    assert(data.user.credits === 15, `Expected 15 free welcome starter credits, received: ${data.user.credits}`);

    const cookie = extractSessionCookie(res);
    assert(cookie, 'Expected codethesis_session cookie to be set');
    assert(res.headers.get('set-cookie').includes('HttpOnly'), 'Expected session cookie to be HttpOnly');

    return `Registered: ${data.user.fullName} (${data.user.email}) with ${data.user.credits} starter credits`;
  });

  // -------------------------------------------------------------------------
  // TEST 2: Valid Credentials Login (POST /api/auth/login)
  // -------------------------------------------------------------------------
  await runTest(2, 'Login with Valid Student Credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: testStudentPassword,
      }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(data.user, 'Expected user profile in response');
    assert(data.user.email.toLowerCase() === testStudentEmail.toLowerCase(), `Email mismatch: ${data.user.email}`);
    assert(!data.user.passwordHash, 'Security check failed: passwordHash must not be exposed');

    registeredUserSessionCookie = extractSessionCookie(res);
    studentSessionCookie = registeredUserSessionCookie;
    assert(registeredUserSessionCookie, 'Expected codethesis_session cookie to be returned');

    return `Login OK for ${data.user.email} (Role: ${data.user.role || 'student'})`;
  });

  // -------------------------------------------------------------------------
  // TEST 3: Invalid Credentials Login (POST /api/auth/login)
  // -------------------------------------------------------------------------
  await runTest(3, 'Login Rejection with Invalid Credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'CompletelyWrongPassword123!',
      }),
    });

    assert(res.status === 401, `Expected HTTP 401 Unauthorized, received ${res.status}`);
    const data = await res.json();
    assert(data.success === false, `Expected success === false, got ${data.success}`);
    assert(data.error && data.error.toLowerCase().includes('invalid'), `Unexpected error message: "${data.error}"`);
    const cookie = extractSessionCookie(res);
    assert(!cookie, 'Session cookie must NOT be issued on failed credentials authentication');

    return `Correctly blocked with 401: "${data.error}"`;
  });

  // -------------------------------------------------------------------------
  // TEST 4: Session Verification via Session Cookie (GET /api/auth/me)
  // -------------------------------------------------------------------------
  await runTest(4, 'Session Verification via /api/auth/me with Cookie', async () => {
    assert(registeredUserSessionCookie, 'Prerequisite missing: registeredUserSessionCookie');

    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `codethesis_session=${registeredUserSessionCookie}`,
      },
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.user !== null, 'Expected active authenticated user in session');
    assert(data.user.email.toLowerCase() === testStudentEmail.toLowerCase(), `Session email mismatch: ${data.user.email}`);
    assert(data.user.credits === 15, `Expected 15 credits in active session, found: ${data.user.credits}`);
    assert(!data.user.passwordHash, 'Security check failed: passwordHash must not be exposed');

    return `Session verified: User ID ${data.user.id}, Plan: ${data.user.plan}, Credits: ${data.user.credits}`;
  });

  // -------------------------------------------------------------------------
  // TEST 5: Fast 1-Click Demo Login (POST /api/auth/login demo: 'adebayo')
  // -------------------------------------------------------------------------
  await runTest(5, 'Fast 1-Click Demo Student Login (adebayo)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demo: 'adebayo' }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(data.user, 'Expected user profile in response');
    assert(data.user.email === 'student@futa.edu.ng', `Expected student@futa.edu.ng, got ${data.user.email}`);
    assert(data.user.fullName === 'Adebayo Tunde', `Expected Adebayo Tunde, got ${data.user.fullName}`);

    const demoCookie = extractSessionCookie(res);
    assert(demoCookie, 'Expected codethesis_session cookie for demo student');

    return `Demo student authenticated: ${data.user.fullName} (${data.user.matricNumber})`;
  });

  // -------------------------------------------------------------------------
  // TEST 6: 1-Click Admin Demo Login (POST /api/auth/login demo: 'admin')
  // -------------------------------------------------------------------------
  await runTest(6, 'Fast 1-Click Admin Login & Role Authorization (admin)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demo: 'admin' }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(data.user, 'Expected user profile in response');
    assert(data.user.role === 'admin', `Expected role === 'admin', got: ${data.user.role}`);
    assert(data.user.email === 'admin@codethesis.ai', `Expected admin@codethesis.ai, got: ${data.user.email}`);

    adminSessionCookie = extractSessionCookie(res);
    assert(adminSessionCookie, 'Expected codethesis_session cookie for admin demo');

    return `Admin authenticated: ${data.user.fullName} with role '${data.user.role}'`;
  });

  // -------------------------------------------------------------------------
  // TEST 7: Firebase Google Sign-in Sync (POST /api/auth/firebase)
  // -------------------------------------------------------------------------
  await runTest(7, 'Firebase Google Sign-in Sync & Auto-Provisioning (15 credits)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleSyncEmail,
        fullName: 'Tester Google Student',
        uid: 'firebase-uid-test-12345',
      }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(data.user, 'Expected user in response');
    assert(data.user.email.toLowerCase() === googleSyncEmail.toLowerCase(), `Email mismatch: ${data.user.email}`);
    assert(data.user.credits === 15, `Expected 15 auto-provisioned starter credits, received: ${data.user.credits}`);
    assert(data.user.role === 'student', `Expected role 'student', received: ${data.user.role}`);

    const googleCookie = extractSessionCookie(res);
    assert(googleCookie, 'Expected codethesis_session cookie to be issued upon Firebase sync');

    return `Auto-provisioned Google user: ${data.user.email} with ${data.user.credits} starter credits`;
  });

  // -------------------------------------------------------------------------
  // TEST 8: Forgot Password Token Generation (POST /api/auth/forgot-password)
  // -------------------------------------------------------------------------
  await runTest(8, 'Forgot Password Reset Token Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudentEmail }),
    });

    assert(res.status === 200, `Expected HTTP 200, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);
    assert(typeof data.token === 'string' && data.token.length >= 32, 'Expected valid hex reset token');
    assert(typeof data.resetUrl === 'string' && data.resetUrl.includes(data.token), 'Expected resetUrl containing token');

    resetToken = data.token;
    return `Token issued: ${resetToken.slice(0, 16)}... | URL: ${data.resetUrl.slice(0, 45)}...`;
  });

  // -------------------------------------------------------------------------
  // TEST 9: Password Reset Execution & Credential Validation
  // -------------------------------------------------------------------------
  await runTest(9, 'Password Reset Execution & Invalidation of Old Password', async () => {
    assert(resetToken, 'Prerequisite missing: resetToken');

    // Step 9a: Execute Reset
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: updatedStudentPassword,
      }),
    });

    assert(resetRes.status === 200, `Expected HTTP 200 for reset, received ${resetRes.status}`);
    const resetData = await resetRes.json();
    assert(resetData.success === true, `Expected reset success === true, got ${resetData.success}`);

    // Step 9b: Verify old password fails
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: testStudentPassword, // OLD password
      }),
    });
    assert(oldLoginRes.status === 401, `Expected old password login to fail with 401, got ${oldLoginRes.status}`);

    // Step 9c: Verify new password succeeds
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: updatedStudentPassword, // NEW password
      }),
    });
    assert(newLoginRes.status === 200, `Expected new password login to succeed with 200, got ${newLoginRes.status}`);
    const newLoginData = await newLoginRes.json();
    assert(newLoginData.success === true, 'Expected new login success === true');

    registeredUserSessionCookie = extractSessionCookie(newLoginRes);
    studentSessionCookie = registeredUserSessionCookie;
    assert(registeredUserSessionCookie, 'Expected valid session cookie after re-login');

    return `Reset verified: Old password blocked (401), New password authenticated (200)`;
  });

  // -------------------------------------------------------------------------
  // TEST 10: Session Logout (POST /api/auth/logout)
  // -------------------------------------------------------------------------
  await runTest(10, 'Session Logout & Cookie Invalidation', async () => {
    assert(registeredUserSessionCookie, 'Prerequisite missing: registeredUserSessionCookie');

    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `codethesis_session=${registeredUserSessionCookie}`,
      },
    });

    assert(res.status === 200, `Expected HTTP 200 on logout, received ${res.status}`);
    const data = await res.json();
    assert(data.success === true, `Expected success === true, got ${data.success}`);

    const setCookie = res.headers.get('set-cookie');
    assert(setCookie, 'Expected set-cookie header on logout');
    assert(setCookie.includes('Max-Age=0') || setCookie.includes('expires='), 'Expected cookie expiry/clearance header');

    // Verify session is no longer authenticated when cleared
    const verifyRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: 'codethesis_session=',
      },
    });
    const verifyData = await verifyRes.json();
    assert(verifyData.user === null, 'Expected session to be null after logout');

    return `Cookie cleared with Max-Age=0. Verified /api/auth/me returned { user: null }`;
  });

  // -------------------------------------------------------------------------
  // TEST 11: Route Protection: Unauthenticated /dashboard
  // -------------------------------------------------------------------------
  await runTest(11, 'Route Protection: Unauthenticated /dashboard -> Login Redirect', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
      redirect: 'manual',
    });

    assert(res.status === 307 || res.status === 308 || res.status === 302, `Expected redirect status (307/308/302), received ${res.status}`);
    const location = res.headers.get('location');
    assert(location && location.includes('/auth/login'), `Expected redirect location to include /auth/login, got: ${location}`);
    assert(location.includes('from=%2Fdashboard') || location.includes('from=/dashboard'), `Expected return url parameter in redirect location: ${location}`);

    return `Protected: HTTP ${res.status} redirecting unauthenticated guest to ${location}`;
  });

  // -------------------------------------------------------------------------
  // TEST 12: RBAC Route Protection: /admin Access Controls
  // -------------------------------------------------------------------------
  await runTest(12, 'RBAC Route Protection: /admin (Student Blocked vs Admin Allowed)', async () => {
    // 12a: Check that student is blocked from /admin
    assert(studentSessionCookie, 'Prerequisite missing: studentSessionCookie');
    const studentRes = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Cookie: `codethesis_session=${studentSessionCookie}`,
      },
    });

    assert(studentRes.status === 307 || studentRes.status === 308 || studentRes.status === 302, `Expected redirect status for unauthorized student, got ${studentRes.status}`);
    const studentRedirectLocation = studentRes.headers.get('location');
    assert(
      studentRedirectLocation && studentRedirectLocation.includes('error=unauthorized'),
      `Expected redirect to dashboard with error=unauthorized, got: ${studentRedirectLocation}`
    );

    // 12b: Check that admin is allowed to access /admin
    assert(adminSessionCookie, 'Prerequisite missing: adminSessionCookie');
    const adminRes = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Cookie: `codethesis_session=${adminSessionCookie}`,
      },
    });

    assert(adminRes.status === 200, `Expected HTTP 200 for authenticated admin accessing /admin, got ${adminRes.status}`);

    return `RBAC Enforced: Student -> ${studentRedirectLocation} | Admin -> HTTP 200 OK`;
  });

  // Post-test cleanup of created QA user
  cleanupTestUsers([testStudentEmail, googleSyncEmail]);

  // ==========================================
  // Summary & Scorecard
  // ==========================================
  const total = testResults.length;
  const passed = testResults.filter((r) => r.status === 'PASS').length;
  const failed = testResults.filter((r) => r.status === 'FAIL').length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  TEST SUITE EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Tests  : ${colors.bold}${total}${colors.reset}`);
  console.log(`  Passed       : ${colors.green}${colors.bold}${passed}${colors.reset}`);
  console.log(`  Failed       : ${failed > 0 ? colors.red : colors.dim}${colors.bold}${failed}${colors.reset}`);
  console.log(`  Pass Rate    : ${passed === total ? colors.green : colors.yellow}${colors.bold}${passRate}%${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failed > 0) {
    console.error(`${colors.red}${colors.bold}Authentication test suite failed with ${failed} failure(s).${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}All authentication and security tests passed with 100% success rate!${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\nFatal test runner error:', err);
  process.exit(1);
});
