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

const targetEmail = 'superadmin@xfly.com';
const targetPassword = 'Password123!';

async function repair() {
  console.log("Project:", env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Inspect users
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
  if (usersError) {
    console.error("Failed to list users:", usersError);
    return;
  }
  
  let user = usersData.users.find(u => u.email === targetEmail);
  
  if (!user) {
    console.log("User does not exist. Creating...");
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true
    });
    if (createError) {
      console.error("Create failed:", createError);
      return;
    }
    user = createData.user;
    console.log("User created:", user.id);
  } else {
    console.log("User exists:", user.id);
    console.log("Email confirmed:", !!user.email_confirmed_at);
    // Force update password and confirmation
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: targetPassword,
      email_confirm: true
    });
    if (updateError) {
      console.error("Update failed:", updateError);
      return;
    }
    console.log("Password and confirmation updated.");
  }

  // 2. Inspect Role
  const { data: roleData, error: roleError } = await adminClient.from('admin_roles').select('*').eq('id', user.id).single();
  
  if (!roleData) {
    console.log("Role missing. Inserting super_admin role...");
    const { error: insertRoleError } = await adminClient.from('admin_roles').insert({ id: user.id, role: 'super_admin' });
    if (insertRoleError) console.error("Role insert failed:", insertRoleError);
    else console.log("Role inserted.");
  } else if (roleData.role !== 'super_admin') {
    console.log("Role incorrect. Updating to super_admin...");
    const { error: updateRoleError } = await adminClient.from('admin_roles').update({ role: 'super_admin' }).eq('id', user.id);
    if (updateRoleError) console.error("Role update failed:", updateRoleError);
    else console.log("Role updated.");
  } else {
    console.log("Role is already super_admin.");
  }

  // 3. Direct Authentication Test
  console.log("\nTesting direct authentication...");
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword
  });

  if (authError) {
    console.error("Direct Auth Failed:", authError.message);
  } else {
    console.log("Direct Auth PASS. Session created.");
  }
}
repair();
