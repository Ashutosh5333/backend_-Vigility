const pool = require('../config/database');

class FeatureClick {
  static async create(userId, featureName) {
    const query = `
      INSERT INTO feature_clicks (user_id, feature_name, timestamp)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, user_id, feature_name, timestamp
    `;
    
    const values = [userId, featureName];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAggregated(filters = {}) {
    let query = `
      SELECT 
        fc.feature_name,
        COUNT(*) as click_count
      FROM feature_clicks fc
      INNER JOIN users u ON fc.user_id = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCounter = 1;

    // Apply date range filter
    if (filters.startDate) {
      query += ` AND fc.timestamp >= $${paramCounter}`;
      values.push(filters.startDate);
      paramCounter++;
    }

    if (filters.endDate) {
      query += ` AND fc.timestamp <= $${paramCounter}`;
      values.push(filters.endDate);
      paramCounter++;
    }

    // Apply age filter
    if (filters.age) {
      if (filters.age === '<18') {
        query += ` AND u.age < 18`;
      } else if (filters.age === '18-40') {
        query += ` AND u.age >= 18 AND u.age <= 40`;
      } else if (filters.age === '>40') {
        query += ` AND u.age > 40`;
      }
    }

    // Apply gender filter
    if (filters.gender && filters.gender !== 'All') {
      query += ` AND u.gender = $${paramCounter}`;
      values.push(filters.gender);
      paramCounter++;
    }

    query += ` GROUP BY fc.feature_name ORDER BY click_count DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getTimeTrend(featureName, filters = {}) {
    let query = `
      SELECT 
        DATE(fc.timestamp) as date,
        COUNT(*) as click_count
      FROM feature_clicks fc
      INNER JOIN users u ON fc.user_id = u.id
      WHERE fc.feature_name = $1
    `;
    
    const values = [featureName];
    let paramCounter = 2;

    // Apply date range filter
    if (filters.startDate) {
      query += ` AND fc.timestamp >= $${paramCounter}`;
      values.push(filters.startDate);
      paramCounter++;
    }

    if (filters.endDate) {
      query += ` AND fc.timestamp <= $${paramCounter}`;
      values.push(filters.endDate);
      paramCounter++;
    }

    // Apply age filter
    if (filters.age) {
      if (filters.age === '<18') {
        query += ` AND u.age < 18`;
      } else if (filters.age === '18-40') {
        query += ` AND u.age >= 18 AND u.age <= 40`;
      } else if (filters.age === '>40') {
        query += ` AND u.age > 40`;
      }
    }

    // Apply gender filter
    if (filters.gender && filters.gender !== 'All') {
      query += ` AND u.gender = $${paramCounter}`;
      values.push(filters.gender);
      paramCounter++;
    }

    query += ` GROUP BY DATE(fc.timestamp) ORDER BY date`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async bulkCreate(clicks) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const click of clicks) {
        await client.query(
          'INSERT INTO feature_clicks (user_id, feature_name, timestamp) VALUES ($1, $2, $3)',
          [click.user_id, click.feature_name, click.timestamp]
        );
      }
      
      await client.query('COMMIT');
      return { success: true, count: clicks.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = FeatureClick;
