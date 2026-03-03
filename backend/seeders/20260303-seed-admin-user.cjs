'use strict';

const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

module.exports = {
  up: async (queryInterface) => {
    const [result] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS count FROM users;'
    );

    const existingCount = Number(result[0]?.count || 0);

    if (existingCount > 0) {
      console.log('Users table already has data. Skipping admin seed.');
      return;
    }

    const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'admin123';
    const saltRounds = Number(process.env.saltRounds || 10);

    const hashedPassword = await bcrypt.hash(adminPasswordPlain, saltRounds);

    await queryInterface.bulkInsert('users', [
      {
        created_at: new Date(),
        firstname: 'Admin',
        lastname: 'User',
        password: hashedPassword,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};

