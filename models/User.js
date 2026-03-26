const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, password, age, gender) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, password, age, gender)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, age, gender, created_at
    `;
    
    const values = [username, hashedPassword, age, gender];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, age, gender, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll() {
    const query = 'SELECT id, username, age, gender, created_at FROM users ORDER BY id';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = User;
