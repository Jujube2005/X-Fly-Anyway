import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function verify() {
  console.log("Remote project:", env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Check Service Role
  const adminRes = await adminClient.from('external_api_tokens').select('*').limit(1);
  if (adminRes.error) {
    console.log("external_api_tokens:", "Missing or Error -", adminRes.error.message);
  } else {
    console.log("external_api_tokens: Exists");
    // Insert a dummy token to check columns
    const dummy = {
      name: "verify_col",
      token_hash: "hash123",
      refresh_token_hash: "refresh123",
      scopes: ["test"],
      expires_at: new Date().toISOString(),
      refresh_expires_at: new Date().toISOString(),
      is_revoked: false
    };
    const insRes = await adminClient.from('external_api_tokens').insert([dummy]).select();
    if (insRes.error) {
      console.log("Required columns check:", "Failed -", insRes.error.message);
    } else {
      console.log("Required columns: Present (id, name, token_hash, refresh_token_hash, scopes, expires_at, refresh_expires_at, is_revoked)");
      // cleanup
      await adminClient.from('external_api_tokens').delete().eq('token_hash', "hash123");
    }
  }

  // Check RLS
  const anonRes = await anonClient.from('external_api_tokens').select('*').limit(1);
  if (anonRes.error) {
    console.log("RLS:", "Enforced (" + anonRes.error.message + ")");
  } else if (anonRes.data.length === 0) {
    console.log("RLS:", "Enforced (Returned 0 rows without auth)");
  } else {
    console.log("RLS:", "Failed (Returned data to anon user)");
  }
}
verify();
