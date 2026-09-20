import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("TC-ADM-012: Testing Admin API bypass with non-company identity");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testnoncompany@gmail.com',
    password: 'Password123!'
  });

  if (error || !data.session) {
    console.error("Login failed:", error);
    return;
  }

  const token = data.session.access_token;
  const res = await fetch("http://localhost:3000/api/admin/analytics?period=monthly", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const status = res.status;
  console.log("Status:", status);
  if (status === 403) {
    console.log("PASS - API correctly returned 403 Forbidden");
  } else {
    console.log("FAIL - API returned", status);
    console.log(await res.text());
  }
}
run();
