const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_UErmiMod7Py2@ep-misty-violet-aor9g96m-pooler.c-2.ap-southeast-1.aws.neon.tech/boarding_house?sslmode=require'
});

async function run() {
  await client.connect();
  
  const res = await client.query('SELECT c.id, c.status, r.id as room_id, b.id as building_id, b.landlord_id FROM contracts c LEFT JOIN rooms r ON c.room_id = r.id LEFT JOIN buildings b ON r.building_id = b.id');
  console.log("Contracts:", res.rows);
  
  const res2 = await client.query('SELECT id, full_name, role FROM users');
  console.log("Users:", res2.rows);

  await client.end();
}

run().catch(console.error);
