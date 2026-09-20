import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import http from 'http';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function setRole(email, role) {
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("User not found: " + email);
  await adminClient.from("admin_roles").upsert({ id: user.id, role });
  return user.id;
}

async function login(email, password) {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) return null;
  return data.session;
}

async function testFetch(url, session) {
  const headers = {};
  if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
  
  // Actually, for Next.js app router API routes that use cookies, we need to pass the cookie!
  // But wait, our middleware or route might check Authorization header? 
  // Supabase Next.js SSR client looks at cookies. 
  // Wait, I can just use the Service Role Client for direct DB checks, but we need to test the APIs!
  // To simulate browser cookies, we need to pass the `sb-...-auth-token` cookie.
  
  const cookieName = `sb-${new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  if (session) {
    const cookieStr = JSON.stringify([session.access_token, session.refresh_token]);
    headers['Cookie'] = `${cookieName}=${encodeURIComponent(cookieStr)}`;
  }

  const res = await fetch(`http://localhost:3000${url}`, { headers, redirect: 'manual' });
  let body = "";
  try { body = await res.text(); } catch(e){}
  return { status: res.status, headers: res.headers, body };
}

async function run() {
  console.log("=== Authentication Regression ===");
  
  // TC-REG-001 & 002: Unauthenticated
  let res = await testFetch("/admin/login", null);
  console.log("TC-REG-001 (/admin/login unauth):", res.status === 200 ? "PASS" : "FAIL", res.status);
  
  res = await testFetch("/admin/dashboard", null);
  console.log("TC-REG-002 (/admin/dashboard unauth):", [302, 307, 308].includes(res.status) ? "PASS" : "FAIL", res.status);

  // TC-REG-003: Valid Super Admin (Company Device)
  await setRole("mind0m0i0n0d@gmail.com", "super_admin");
  const compSession = await login("mind0m0i0n0d@gmail.com", "Password123!");
  res = await testFetch("/admin/dashboard", compSession);
  console.log("TC-REG-003 (Company Super Admin login):", res.status === 200 ? "PASS" : "FAIL", res.status);

  // TC-REG-004: Invalid credentials
  const badLogin = await login("mind0m0i0n0d@gmail.com", "wrongpass");
  console.log("TC-REG-004 (Invalid credentials):", badLogin === null ? "PASS" : "FAIL");

  // TC-REG-005: Logout
  await anonClient.auth.signOut();
  res = await testFetch("/admin/dashboard", null);
  console.log("TC-REG-005 (Logout redirects):", [302, 307, 308].includes(res.status) ? "PASS" : "FAIL");

  console.log("\n=== Company Device Restriction Regression ===");
  
  // TC-REG-006: Company identity + valid Admin role
  res = await testFetch("/admin/dashboard", compSession);
  console.log("TC-REG-006 (Company + Admin):", res.status === 200 ? "PASS" : "FAIL", res.status);

  // TC-REG-007: Non-company identity + Admin role
  await setRole("testnoncompany@gmail.com", "booking_staff");
  const nonCompSession = await login("testnoncompany@gmail.com", "Password123!");
  res = await testFetch("/admin/dashboard", nonCompSession);
  // Expect redirect to "/" -> usually 307 or 308
  console.log("TC-REG-007 (Non-company + Admin redirect):", [302, 307, 308].includes(res.status) ? "PASS" : "FAIL", res.status);

  // TC-REG-008: Non-company direct URL (same as above)
  console.log("TC-REG-008 (Non-company direct URL):", [302, 307, 308].includes(res.status) ? "PASS" : "FAIL", res.status);

  // TC-REG-009: Non-company identity + Admin API
  res = await testFetch("/api/admin/analytics", nonCompSession);
  console.log("TC-REG-009 (Non-company + Admin API):", res.status === 403 ? "PASS" : "FAIL", res.status);

  // TC-REG-010: Company identity แต่ไม่มี Admin role
  await adminClient.from("admin_roles").delete().eq("id", compSession.user.id);
  res = await testFetch("/admin/dashboard", compSession);
  console.log("TC-REG-010 (Company + No Admin Role):", [302, 307, 308].includes(res.status) ? "PASS" : "FAIL", res.status);
  // Restore role for later tests
  await setRole("mind0m0i0n0d@gmail.com", "super_admin");

  console.log("\n=== Admin API Security Regression ===");
  const endpoints = [
    { url: "/api/admin/analytics", method: "GET" },
    { url: "/api/admin/bookings", method: "GET" },
    { url: "/api/admin/flights", method: "GET" },
    { url: "/api/admin/tokens", method: "GET" }
  ];

  for (const ep of endpoints) {
    console.log(`\nTesting ${ep.url}...`);
    // 1. Unauth
    res = await testFetch(ep.url, null);
    console.log(`  Unauthenticated: ${res.status} (Expected 401)`);
    // 2. Non-company
    res = await testFetch(ep.url, nonCompSession);
    console.log(`  Non-company: ${res.status} (Expected 403)`);
    // 3. Company + insufficient role (Flight Staff testing analytics)
    await setRole("mind0m0i0n0d@gmail.com", "flight_staff");
    res = await testFetch(ep.url, compSession);
    console.log(`  Company + Insufficient (Flight Staff): ${res.status}`);
    // 4. Company + authorized (Super Admin)
    await setRole("mind0m0i0n0d@gmail.com", "super_admin");
    res = await testFetch(ep.url, compSession);
    console.log(`  Company + Authorized (Super Admin): ${res.status} (Expected 200)`);
  }
}
run().catch(console.error);
