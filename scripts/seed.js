const pool = require('../config/database');
const User = require('../models/User');
const FeatureClick = require('../models/FeatureClick');

const features = [
  'date_filter',
  'age_filter',
  'gender_filter',
  'bar_chart',
  'line_chart',
  'bar_chart_click',
  'refresh_button',
  'export_button',
];

const usernames = [
  'john_doe', 'jane_smith', 'alice_wilson', 'bob_brown', 'charlie_davis',
  'diana_evans', 'frank_garcia', 'grace_harris', 'henry_jackson', 'isabel_king',
  'jack_lee', 'kate_martin', 'liam_moore', 'mia_nelson', 'noah_parker',
];

const genders = ['Male', 'Female', 'Other'];

// Generate random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random date between start and end
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create users
    console.log('Creating users...');
    const createdUsers = [];

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      const password = 'password123'; // Same password for all demo users
      const age = randomInt(15, 65);
      const gender = randomElement(genders);

      try {
        const user = await User.create(username, password, age, gender);
        createdUsers.push(user);
        console.log(`  ✓ Created user: ${username} (age: ${age}, gender: ${gender})`);
      } catch (error) {
        // User might already exist
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
          createdUsers.push(existingUser);
          console.log(`  ⚠ User ${username} already exists, using existing user`);
        }
      }
    }

    console.log(`\n✅ Created/found ${createdUsers.length} users`);

    // Create feature clicks (100-150 random clicks)
    console.log('\nCreating feature clicks...');
    const clicksToCreate = [];
    const numClicks = randomInt(100, 150);

    // Date range: last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < numClicks; i++) {
      const user = randomElement(createdUsers);
      const feature = randomElement(features);
      const timestamp = randomDate(startDate, endDate);

      clicksToCreate.push({
        user_id: user.id,
        feature_name: feature,
        timestamp: timestamp.toISOString(),
      });
    }

    // Sort clicks by timestamp
    clicksToCreate.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Insert clicks in bulk
    await FeatureClick.bulkCreate(clicksToCreate);

    console.log(`✅ Created ${numClicks} feature click records`);

    // Display summary statistics
    console.log('\n📊 Seeding Summary:');
    console.log(`  Total Users: ${createdUsers.length}`);
    console.log(`  Total Clicks: ${numClicks}`);
    console.log(`  Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    console.log(`  Features Tracked: ${features.join(', ')}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Demo Login Credentials:');
    console.log('  Username: any of the created users (e.g., john_doe)');
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
