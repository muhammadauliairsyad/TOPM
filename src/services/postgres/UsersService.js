const pool = require('./pool');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

const InvariantError = require('../../utils/invariantError');
const AuthenticationError = require('../../utils/authenticationError');
const NotFoundError = require('../../utils/notFoundError');

class UsersService {
  async addUser({ username, password, fullname }) {
    // cek username sudah dipakai belum
    const check = await pool.query({
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    });

    if (check.rowCount) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query({
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    });

    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getUserById(userId) {
    const result = await pool.query({
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyUserCredential(username, password) {
    const result = await pool.query({
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    });

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
