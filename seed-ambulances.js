import { query } from './server/db/pool.js';

async function seedAmbulances() {
  try {
    console.log('Seeding ambulances...');
    const ambulances = [
      ['CHC-CENTRAL', 'transport', {
        name: "Ambulance B2 (BLS)",
        status: "In-Transit",
        fuel_level: "60%",
        driver_contact: "+91 9876543211"
      }],
      ['PHC-EAST', 'transport', {
        name: "Ambulance C3 (ALS)",
        status: "Out of Service",
        fuel_level: "10%",
        driver_contact: "+91 9876543212"
      }],
      ['PHC-NORTH', 'transport', {
        name: "Ambulance A2 (BLS)",
        status: "Available",
        fuel_level: "95%",
        driver_contact: "+91 9876543213"
      }]
    ];

    for (const amb of ambulances) {
      await query(
        `INSERT INTO logistics (center_id, category, itemPayload) VALUES ($1, $2, $3)`,
        [amb[0], amb[1], JSON.stringify(amb[2])]
      );
    }
    console.log('Ambulances seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding ambulances:', err);
    process.exit(1);
  }
}

seedAmbulances();
