import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evolttrxtpbfiiomhpze.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b2x0dHJ4dHBiZmlpb21ocHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3MTExOSwiZXhwIjoyMTAzNTQ3MTE5fQ.N8cHO4-_VfA7UKXWDmvCtXiX4YjwMc-Npgqla7kb7ME';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  console.log('Creating users...');
  const usersToCreate = [
    { email: 'superadmin@xfly.com', role: 'super_admin' },
    { email: 'flight1@xfly.com', role: 'flight_staff' },
    { email: 'flight2@xfly.com', role: 'flight_staff' },
    { email: 'booking@xfly.com', role: 'booking_staff' }
  ];

  for (const u of usersToCreate) {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'password123',
      email_confirm: true
    });
    
    if (authErr) {
      console.log(`Failed to create ${u.email}:`, authErr.message);
      continue;
    }
    
    const userId = authData.user.id;
    console.log(`Created user ${u.email} with ID ${userId}`);
    
    const { error: roleErr } = await supabase.from('admin_roles').insert({
      id: userId,
      role: u.role
    });
    
    if (roleErr) console.log(`Failed to insert role for ${u.email}:`, roleErr.message);
  }

  // Get flights for flight staff
  const { data: flightStaff } = await supabase.from('admin_roles').select('id').eq('role', 'flight_staff');
  const { data: flights } = await supabase.from('flight').select('id').limit(2);
  
  if (flightStaff && flightStaff.length >= 2 && flights && flights.length >= 2) {
    await supabase.from('flight_staff_assignment').insert([
      { staff_id: flightStaff[0].id, flight_id: flights[0].id },
      { staff_id: flightStaff[1].id, flight_id: flights[1].id }
    ]);
    console.log('Assigned flights to flight staff.');
  }

  console.log('Test data setup complete.');
}

createTestData();
