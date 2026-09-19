import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evolttrxtpbfiiomhpze.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b2x0dHJ4dHBiZmlpb21ocHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3MTExOSwiZXhwIjoyMTAzNTQ3MTE5fQ.N8cHO4-_VfA7UKXWDmvCtXiX4YjwMc-Npgqla7kb7ME';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Fetching users...');
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) console.error(userError);
  
  console.log('Fetching roles...');
  const { data: roles, error: roleError } = await supabase.from('admin_roles').select('*');
  if (roleError) console.error(roleError);

  console.log('Users:');
  users?.users.forEach(u => console.log(`- ${u.id}: ${u.email}`));
  
  console.log('\nRoles:');
  roles?.forEach(r => console.log(`- ${r.id}: ${r.role}`));
}

check();
