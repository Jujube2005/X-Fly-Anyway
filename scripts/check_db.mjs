import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const t1 = await supabase.from('booking_leg').select('id').limit(1);
  console.log("booking_leg (16):", t1.error ? t1.error.message : "Exists");

  const t_seat = await supabase.from('seat_definition').select('id').limit(1);
  console.log("seat_definition (18):", t_seat.error ? t_seat.error.message : "Exists");

  const t_canc = await supabase.from('cancellation').select('id').limit(1);
  console.log("cancellation (19):", t_canc.error ? t_canc.error.message : "Exists");

  const t_auth = await supabase.from('admin_roles').select('id').limit(1);
  console.log("admin_roles (20):", t_auth.error ? t_auth.error.message : "Exists");

  const t2 = await supabase.from('flight_staff').select('id').limit(1);
  console.log("flight_staff (22):", t2.error ? t2.error.message : "Exists");

  const t3 = await supabase.from('external_api_tokens').select('id').limit(1);
  console.log("external_api_tokens (23):", t3.error ? t3.error.message : "Exists");
}
check();
