import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
  const password = "Password123!";
  
  // Create mind0m0i0n0d@gmail.com
  let res1 = await adminClient.auth.admin.createUser({
    email: "mind0m0i0n0d@gmail.com",
    password,
    email_confirm: true
  });
  if (res1.error && res1.error.status !== 422) console.error(res1.error);
  if (res1.error && res1.error.status === 422) {
    // maybe exists, fetch it
    const {data} = await adminClient.auth.admin.listUsers();
    res1 = { data: { user: data.users.find(u => u.email === "mind0m0i0n0d@gmail.com") } };
    await adminClient.auth.admin.updateUserById(res1.data.user.id, { password, email_confirm: true });
  }

  // Create testnoncompany@gmail.com
  let res2 = await adminClient.auth.admin.createUser({
    email: "testnoncompany@gmail.com",
    password,
    email_confirm: true
  });
  if (res2.error && res2.error.status !== 422) console.error(res2.error);
  if (res2.error && res2.error.status === 422) {
    const {data} = await adminClient.auth.admin.listUsers();
    res2 = { data: { user: data.users.find(u => u.email === "testnoncompany@gmail.com") } };
    await adminClient.auth.admin.updateUserById(res2.data.user.id, { password, email_confirm: true });
  }

  // Assign admin roles
  await adminClient.from("admin_roles").upsert({ id: res1.data.user.id, role: "booking_staff" });
  await adminClient.from("admin_roles").upsert({ id: res2.data.user.id, role: "booking_staff" });

  console.log("Test users setup complete.");
}

setup();
