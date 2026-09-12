const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async register(data) {
    const existing = await userRepository.findByUsername(data.username);
    if (existing) {
      const err = new Error('Username is already taken.');
      err.statusCode = 400;
      throw err;
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await userRepository.createUser({
      id: userId,
      schoolId: data.schoolId,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      preferredLanguage: data.preferredLanguage || 'en'
    });

    if (data.role === 'student') {
      await userRepository.createStudentProfile({
        id: uuidv4(),
        userId,
        rollNumber: data.rollNumber,
        grade: data.grade || '8',
        board: data.board || 'StateBoard',
        dateOfBirth: data.dateOfBirth
      });
    } else if (data.role === 'teacher') {
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
