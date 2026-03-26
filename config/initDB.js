const pool = require('./database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR(50) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Feature Clicks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_clicks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        feature_name VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feature_clicks_user_id ON feature_clicks(user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feature_clicks_timestamp ON feature_clicks(timestamp)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feature_clicks_feature_name ON feature_clicks(feature_name)
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createTables };
