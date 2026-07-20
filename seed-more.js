import { query } from './server/db/pool.js';

async function seedMore() {
  try {
    console.log('Seeding more facilities and ambulances...');
    
    // Seed Facilities
    const facilities = [
      ['PHC-NORTH', 'Primary Health Center (North)', 'PHC', 'Surya Nagar', 50, 1, 450],
      ['CHC-CENTRAL', 'Community Health Center (Central)', 'CHC', 'Kaveri District', 150, 0, 1200],
      ['PHC-EAST', 'Primary Health Center (East)', 'PHC', 'Indira Nagar', 30, 3, 210],
      ['PHC-WEST', 'Primary Health Center (West)', 'PHC', 'Surya Nagra', 45, 0, 320],
      ['PHC-SOUTH', 'Primary Health Center (South)', 'PHC', 'Outskirts', 60, 1, 410]
    ];
    
    for (const f of facilities) {
      try {
        await query(
          `INSERT INTO facilities (id, name, type, location, total_beds, critical_alerts, footfall_avg) VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name, type = EXCLUDED.type, location = EXCLUDED.location, 
            total_beds = EXCLUDED.total_beds, critical_alerts = EXCLUDED.critical_alerts, 
            footfall_avg = EXCLUDED.footfall_avg`,
          f
        );
      } catch(e) { console.error('Facility Error:', e.message); }
    }

    // Seed Ambulances
    const ambulances = [
      ['PHC-WEST', 'transport', {
        name: "Ambulance W1 (BLS)",
        status: "Available",
        fuel_level: "80%",
        driver_contact: "+91 9876543214"
      }],
      ['PHC-SOUTH', 'transport', {
        name: "Ambulance S1 (ALS)",
        status: "In-Transit",
        fuel_level: "40%",
        driver_contact: "+91 9876543215"
      }]
    ];

    for (const amb of ambulances) {
      try {
        await query(
          `INSERT INTO logistics (center_id, category, itemPayload) VALUES ($1, $2, $3)`,
          [amb[0], amb[1], JSON.stringify(amb[2])]
        );
      } catch(e) { console.error('Ambulance Error:', e.message); }
    }

    // Initialize messages table with a sample message if empty
    try {
        const msgRes = await query(`SELECT COUNT(*) FROM messages`);
        if (parseInt(msgRes.rows[0].count) === 0) {
            await query(`INSERT INTO messages (sender_role, sender_name, content) VALUES ('admin', 'System', 'Messaging channel initialized.')`);
        }
    } catch (e) { console.error('Message Error:', e.message); }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seedMore();
