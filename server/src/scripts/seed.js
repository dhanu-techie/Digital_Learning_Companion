const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

async function seedDatabase() {
  console.log('[SEED] Starting database seeding process...');

  try {
    await db.initializeDatabase();
    const conn = await db.pool.getConnection();

    // 1. Seed Organization
    const orgId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO organizations (id, name, code) VALUES (?, ?, ?)`,
      [orgId, 'Rural Education Mission Trust', 'REMT_ORG']
    );

    // 2. Seed 2 Schools
    const school1Id = uuidv4();
    const school2Id = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO schools (id, organization_id, name, code, district, state) VALUES 
       (?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?)`,
      [
        school1Id, orgId, 'Govt Higher Secondary School - District A', 'GHSS_DIST_A', 'Dharmapuri', 'Tamil Nadu',
        school2Id, orgId, 'Rural Smart Academy - District B', 'RSA_DIST_B', 'Chittoor', 'Andhra Pradesh'
      ]
    );

    // 3. Password hash for demo users
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 4. Seed Super Admin
    const adminUserId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name)
       VALUES (?, ?, ?, ?, ?, 'super_admin', 'System', 'Admin')`,
      [adminUserId, school1Id, 'admin', 'admin@ruraledu.org', defaultPasswordHash]
    );

    // 5. Seed 20 Teachers
    const teacherUserIds = [];
    for (let i = 1; i <= 20; i++) {
      const uId = uuidv4();
      const tId = uuidv4();
      const schoolId = i <= 10 ? school1Id : school2Id;

      await conn.query(
        `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, 'teacher', ?, ?)`,
        [uId, schoolId, `teacher${i}`, `teacher${i}@ruraledu.org`, defaultPasswordHash, `Teacher_${i}`, `Kumar`]
      );

      await conn.query(
        `INSERT IGNORE INTO teachers (id, user_id, employee_id, qualification, is_available_for_doubts)
         VALUES (?, ?, ?, 'M.Sc. B.Ed.', TRUE)`,
        [tId, uId, `EMP_${1000 + i}`]
      );
      teacherUserIds.push(tId);
    }
    console.log('[SEED] 20 Teachers seeded successfully.');

    // 6. Seed 100 Students
    for (let i = 1; i <= 100; i++) {
      const uId = uuidv4();
      const sId = uuidv4();
      const schoolId = i <= 50 ? school1Id : school2Id;

      await conn.query(
        `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name, preferred_language)
         VALUES (?, ?, ?, ?, ?, 'student', ?, ?, ?)`,
        [uId, schoolId, `student${i}`, `student${i}@ruraledu.org`, defaultPasswordHash, `Student_${i}`, `Ramu`, i % 2 === 0 ? 'ta' : 'en']
      );

      await conn.query(
        `INSERT IGNORE INTO students (id, user_id, roll_number, grade, board)
         VALUES (?, ?, ?, 'Class 8', 'StateBoard')`,
        [sId, uId, `ROLL_${2000 + i}`]
      );
    }
    console.log('[SEED] 100 Students seeded successfully.');

    // 7. Seed Subject, Course, Chapters, Topics, Lessons
    const subjectId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO subjects (id, name, code, grade) VALUES (?, 'Mathematics', 'MATH_8', 'Class 8')`,
      [subjectId]
    );

    const courseId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO courses (id, subject_id, title, description, version, is_published, created_by)
       VALUES (?, ?, 'Class 8 Mathematics - Complete Course', 'Comprehensive math curriculum designed for rural learners.', '1.0', TRUE, adminUserId)`,
      [courseId, subjectId]
    );

    const chapter1Id = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO chapters (id, course_id, title, sequence_order, description)
       VALUES (?, ?, 'Chapter 1: Rational Numbers & Fractions', 1, 'Understanding rational numbers, visual representation, operations.')`,
      [chapter1Id, courseId]
    );

    const topic1Id = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO topics (id, chapter_id, title, sequence_order, concept_summary)
       VALUES (?, ?, 'Topic 1.1: Addition & Subtraction of Fractions', 1, 'Learn how to find LCM and add/subtract fractions step-by-step.')`,
      [topic1Id, chapter1Id]
    );

    const lesson1Id = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO lessons (id, topic_id, title, sequence_order, content_type, text_content, duration_seconds, is_offline_downloadable)
       VALUES (?, ?, 'Visual Introduction to Adding Fractions', 1, 'text', 'Step 1: Identify denominators. Step 2: Calculate common denominator. Step 3: Add numerators.', 600, TRUE)`,
      [lesson1Id, topic1Id]
    );

    // 8. Seed Question Bank, Questions, Assessment
    const qBankId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO question_banks (id, subject_id, title, created_by)
       VALUES (?, ?, 'Math 8 Question Bank', ?)`,
      [qBankId, subjectId, adminUserId]
    );

    const q1Id = uuidv4();
    const q2Id = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO questions (id, question_bank_id, topic_id, question_type, difficulty, question_text, options_json, correct_answer_json, explanation, marks)
       VALUES 
       (?, ?, ?, 'mcq', 'beginner', 'What is 1/4 + 2/4?', '["3/4", "2/8", "1/2", "3/8"]', '"3/4"', 'When denominators match, simply add numerators: 1 + 2 = 3.', 1),
       (?, ?, ?, 'mcq', 'intermediate', 'What is 1/2 + 1/3?', '["2/5", "5/6", "1/6", "3/6"]', '"5/6"', 'Common denominator is 6. 3/6 + 2/6 = 5/6.', 1)`,
      [q1Id, qBankId, topic1Id, q2Id, qBankId, topic1Id]
    );

    const assessmentId = uuidv4();
    await conn.query(
      `INSERT IGNORE INTO assessments (id, subject_id, title, assessment_type, total_marks, passing_marks, created_by)
       VALUES (?, ?, 'Fractions Diagnostic Test', 'diagnostic', 2, 1, ?)`,
      [assessmentId, subjectId, adminUserId]
    );

    await conn.query(
      `INSERT IGNORE INTO assessment_questions (id, assessment_id, question_id, sequence_order, marks) VALUES
       (?, ?, ?, 1, 1),
       (?, ?, ?, 2, 1)`,
      [uuidv4(), assessmentId, q1Id, uuidv4(), assessmentId, q2Id]
    );

    console.log('[SEED] Course, Lessons, Questions, and Assessments seeded.');
    conn.release();
    console.log('[SEED] Database seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('[SEED ERROR]', error.message);
    process.exit(1);
  }
}

seedDatabase();
