const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');

const PUBLIC_ROLES = ['student', 'teacher'];

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

class AuthService {
  async register(data) {
    const username = (data.username || '').trim();
    const password = data.password || '';
    const firstName = (data.firstName || '').trim();
    const lastName = (data.lastName || '').trim();
    const email = (data.email || '').trim() || null;
    const role = (data.role || 'student').trim();

    if (!username || !password || !firstName || !lastName) {
      throw badRequest('Username, password, first name, and last name are required.');
    }
    if (username.length < 3) {
      throw badRequest('Username must be at least 3 characters.');
    }
    if (password.length < 6) {
      throw badRequest('Password must be at least 6 characters.');
    }
    if (!PUBLIC_ROLES.includes(role)) {
      throw badRequest('Role must be student or teacher.');
    }

    const existing = await userRepository.findByUsername(username);
    if (existing) {
      throw badRequest('Username is already taken.');
    }
    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw badRequest('Email is already registered.');
      }
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const schoolId = data.schoolId || await userRepository.ensureDefaultSchool();

    const user = await userRepository.createUser({
      id: userId,
      schoolId,
      username,
      email,
      phoneNumber: data.phoneNumber,
      passwordHash,
      role,
      firstName,
      lastName,
      preferredLanguage: data.preferredLanguage || 'en'
    });

    if (role === 'student') {
      await userRepository.createStudentProfile({
        id: uuidv4(),
        userId,
        rollNumber: data.rollNumber,
        grade: data.grade || '8',
        board: data.board || 'StateBoard',
        dateOfBirth: data.dateOfBirth
      });
    } else if (role === 'teacher') {
      await userRepository.createTeacherProfile({
        id: uuidv4(),
        userId,
        employeeId: data.employeeId,
        qualification: data.qualification
      });
    }

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      const err = new Error('Invalid username or password.');
      err.statusCode = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const err = new Error('Invalid username or password.');
      err.statusCode = 401;
      throw err;
    }

    delete user.password_hash;
    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      schoolId: user.school_id
    };

    const accessToken = jwt.sign(payload, env.JWT.SECRET, { expiresIn: env.JWT.EXPIRES_IN });
    const refreshToken = jwt.sign(payload, env.JWT.REFRESH_SECRET, { expiresIn: env.JWT.REFRESH_EXPIRES_IN });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
