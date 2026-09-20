import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setRole(email, role) {
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("User not found: " + email);
  await adminClient.from("admin_roles").upsert({ id: user.id, role });
  console.log(`Set ${email} to ${role}`);
}

setRole("mind0m0i0n0d@gmail.com", process.argv[2] || "super_admin");
