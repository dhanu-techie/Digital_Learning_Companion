const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

function stableUuid(seed) {
  const hex = crypto.createHash('md5').update(String(seed)).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const IDS = {
  org: 'a1000000-0000-4000-8000-000000000001',
  school: 'a1000000-0000-4000-8000-000000000002',
  admin: 'a1000000-0000-4000-8000-000000000003',
  teacherUser: 'a1000000-0000-4000-8000-000000000004',
  teacher: 'a1000000-0000-4000-8000-000000000005',
  studentUser: 'a1000000-0000-4000-8000-000000000006',
  student: 'a1000000-0000-4000-8000-000000000007',
  math: 'b1000000-0000-4000-8000-000000000001',
  science: 'b1000000-0000-4000-8000-000000000002',
  english: 'b1000000-0000-4000-8000-000000000003',
  mathCourse: 'c1000000-0000-4000-8000-000000000001',
  scienceCourse: 'c1000000-0000-4000-8000-000000000002',
  englishCourse: 'c1000000-0000-4000-8000-000000000003',
  mathCh1: 'd1000000-0000-4000-8000-000000000001',
  mathCh2: 'd1000000-0000-4000-8000-000000000002',
  sciCh1: 'd1000000-0000-4000-8000-000000000003',
  engCh1: 'd1000000-0000-4000-8000-000000000004',
  mathT1: 'e1000000-0000-4000-8000-000000000001',
  mathT2: 'e1000000-0000-4000-8000-000000000002',
  sciT1: 'e1000000-0000-4000-8000-000000000003',
  sciT2: 'e1000000-0000-4000-8000-000000000004',
  engT1: 'e1000000-0000-4000-8000-000000000005',
  bankMath: 'f1000000-0000-4000-8000-000000000001',
  bankSci: 'f1000000-0000-4000-8000-000000000002',
  bankEng: 'f1000000-0000-4000-8000-000000000003',
  assessMath: 'aa000000-0000-4000-8000-000000000001',
  assessSci: 'aa000000-0000-4000-8000-000000000002',
  assessEng: 'aa000000-0000-4000-8000-000000000003',
  class8: 'a1000000-0000-4000-8000-000000000010',
  assignment1: 'a1000000-0000-4000-8000-000000000011',
  parentUser: 'a1000000-0000-4000-8000-000000000012',
  parent: 'a1000000-0000-4000-8000-000000000013',
  parentRel: 'a1000000-0000-4000-8000-000000000014'
};

async function getOrCreateId(selectSql, selectParams, insertSql, insertParams, fallbackId) {
  const [rows] = await db.query(selectSql, selectParams);
  if (rows[0]) return rows[0].id;
  await db.query(insertSql, insertParams);
  return fallbackId;
}

async function insertIgnore(sql, params) {
  await db.query(sql, params);
}

async function seedDemoContent() {
  const [existing] = await db.query('SELECT COUNT(*) AS total FROM courses');
  const alreadySeeded = Number(existing[0]?.total || 0) > 0;

  const orgId = await getOrCreateId(
    'SELECT id FROM organizations WHERE code = ?',
    ['REMT_ORG'],
    'INSERT IGNORE INTO organizations (id, name, code) VALUES (?, ?, ?)',
    [IDS.org, 'Rural Education Mission Trust', 'REMT_ORG'],
    IDS.org
  );

  const schoolId = await getOrCreateId(
    'SELECT id FROM schools WHERE code = ?',
    ['GHSS_DIST_A'],
    `INSERT IGNORE INTO schools (id, organization_id, name, code, district, state)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [IDS.school, orgId, 'Govt Higher Secondary School - District A', 'GHSS_DIST_A', 'Dharmapuri', 'Tamil Nadu'],
    IDS.school
  );

  const passwordHash = await bcrypt.hash('password123', 10);

  await insertIgnore(
    `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name)
     VALUES (?, ?, 'admin', 'admin@ruraledu.org', ?, 'super_admin', 'System', 'Admin')`,
    [IDS.admin, schoolId, passwordHash]
  );
  await insertIgnore(
    `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name)
     VALUES (?, ?, 'teacher1', 'teacher1@ruraledu.org', ?, 'teacher', 'Meena', 'Kumar')`,
    [IDS.teacherUser, schoolId, passwordHash]
  );
  await insertIgnore(
    `INSERT IGNORE INTO teachers (id, user_id, employee_id, qualification, is_available_for_doubts)
     VALUES (?, ?, 'EMP_1001', 'M.Sc. B.Ed.', TRUE)`,
    [IDS.teacher, IDS.teacherUser]
  );
  await insertIgnore(
    `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name, preferred_language)
     VALUES (?, ?, 'student1', 'student1@ruraledu.org', ?, 'student', 'Ramu', 'Selvam', 'en')`,
    [IDS.studentUser, schoolId, passwordHash]
  );
  await insertIgnore(
    `INSERT IGNORE INTO students (id, user_id, roll_number, grade, board)
     VALUES (?, ?, 'ROLL_2001', '8', 'StateBoard')`,
    [IDS.student, IDS.studentUser]
  );

  if (alreadySeeded) {
    console.log('[SEED] Demo users ensured. Courses already present, skipping content insert.');
    await ensureClassroomGraph(schoolId, passwordHash);
    return;
  }

  await insertIgnore(
    `INSERT IGNORE INTO subjects (id, name, code, grade) VALUES
     (?, 'Mathematics', 'MATH_8', '8'),
     (?, 'Science', 'SCI_8', '8'),
     (?, 'English', 'ENG_8', '8')`,
    [IDS.math, IDS.science, IDS.english]
  );

  const adminId = (await db.query('SELECT id FROM users WHERE username = ?', ['admin']))[0][0]?.id || IDS.admin;

  await insertIgnore(
    `INSERT IGNORE INTO courses (id, subject_id, title, description, version, estimated_minutes, is_published, created_by)
     VALUES (?, ?, ?, ?, '1.0', ?, TRUE, ?)`,
    [IDS.mathCourse, IDS.math, 'Class 8 Mathematics — Fractions & Rational Numbers',
      'Learn fractions with visual steps, then practise addition, subtraction, and word problems.', 45, adminId]
  );
  await insertIgnore(
    `INSERT IGNORE INTO courses (id, subject_id, title, description, version, estimated_minutes, is_published, created_by)
     VALUES (?, ?, ?, ?, '1.0', ?, TRUE, ?)`,
    [IDS.scienceCourse, IDS.science, 'Class 8 Science — Force and Pressure',
      'Understand force, pressure, and everyday examples from village wells, bicycles, and school bags.', 40, adminId]
  );
  await insertIgnore(
    `INSERT IGNORE INTO courses (id, subject_id, title, description, version, estimated_minutes, is_published, created_by)
     VALUES (?, ?, ?, ?, '1.0', ?, TRUE, ?)`,
    [IDS.englishCourse, IDS.english, 'Class 8 English — Reading for Meaning',
      'Short passages and questions to build comprehension, vocabulary, and confident written answers.', 30, adminId]
  );

  await insertIgnore(
    `INSERT IGNORE INTO chapters (id, course_id, title, sequence_order, description) VALUES
     (?, ?, 'Chapter 1: Understanding Fractions', 1, 'Parts of a whole, equivalent fractions, and simplest form.'),
     (?, ?, 'Chapter 2: Adding and Subtracting Fractions', 2, 'Same and different denominators with LCM.'),
     (?, ?, 'Chapter 1: What is Force?', 1, 'Push, pull, and the effects of force.'),
     (?, ?, 'Chapter 1: Finding the Main Idea', 1, 'Read a short passage and answer in your own words.')`,
    [IDS.mathCh1, IDS.mathCourse, IDS.mathCh2, IDS.mathCourse, IDS.sciCh1, IDS.scienceCourse, IDS.engCh1, IDS.englishCourse]
  );

  await insertIgnore(
    `INSERT IGNORE INTO topics (id, chapter_id, title, sequence_order, concept_summary) VALUES
     (?, ?, 'Parts of a whole', 1, 'A fraction names equal parts of one whole.'),
     (?, ?, 'Unlike denominators', 1, 'Use LCM so both fractions share one denominator.'),
     (?, ?, 'Push and pull', 1, 'Force is a push or a pull that can change motion.'),
     (?, ?, 'Pressure in daily life', 2, 'Pressure is force acting on a surface area.'),
     (?, ?, 'Main idea and details', 1, 'The main idea is the most important point the writer makes.')`,
    [IDS.mathT1, IDS.mathCh1, IDS.mathT2, IDS.mathCh2, IDS.sciT1, IDS.sciCh1, IDS.sciT2, IDS.sciCh1, IDS.engT1, IDS.engCh1]
  );

  const lessons = [
    [IDS.mathT1, 'What is a fraction?', 1, 'A fraction has two parts. The denominator (bottom) tells how many equal parts make the whole. The numerator (top) tells how many of those parts you have. Example: 3/4 means 3 parts out of 4 equal parts. If a roti is cut into 4 equal pieces and you take 3, you have 3/4 of the roti.'],
    [IDS.mathT1, 'Equivalent fractions', 2, 'Equivalent fractions look different but have the same value. Multiply or divide the numerator and denominator by the same number. 1/2 = 2/4 = 3/6. A good check: cross-multiply. For 1/2 and 2/4, 1×4 = 2×2 = 4, so they are equivalent.'],
    [IDS.mathT2, 'Adding like fractions', 1, 'When denominators are the same, add only the numerators and keep the denominator. 1/5 + 2/5 = 3/5. Do not add the denominators. Think of same-size pieces of the same chocolate bar.'],
    [IDS.mathT2, 'Adding unlike fractions', 2, 'When denominators differ, find the LCM. For 1/2 + 1/3, LCM of 2 and 3 is 6. Convert: 1/2 = 3/6 and 1/3 = 2/6. Add: 3/6 + 2/6 = 5/6.'],
    [IDS.sciT1, 'Force is a push or a pull', 1, 'A force can start motion, stop motion, change speed, or change direction. Opening a school door is a pull. Kicking a football is a push. Force is measured in newtons (N).'],
    [IDS.sciT1, 'Effects of force', 2, 'Force can change the shape of an object. Pressing clay, squeezing a rubber ball, or stretching a rubber band are all effects of force. If two teams pull a rope with equal force, the rope may not move — the forces are balanced.'],
    [IDS.sciT2, 'What is pressure?', 1, 'Pressure = Force ÷ Area. A sharp knife cuts better than a blunt knife because the same force acts on a smaller area, so pressure is higher. That is why school bags with wide straps feel more comfortable.'],
    [IDS.engT1, 'Read: The Village Library', 1, 'Every evening, Meena walked to the small library near the bus stop. She borrowed one book each week and told the stories to her younger brother. Soon other children came to listen. The librarian smiled and said, "A story shared becomes two stories."'],
    [IDS.engT1, 'How to find the main idea', 2, 'Ask: what is this passage mostly about? Details support the main idea; they are not the main idea themselves. In "The Village Library", the main idea is that sharing stories can bring a community together.']
  ];

  for (let i = 0; i < lessons.length; i += 1) {
    const [topicId, title, order, text] = lessons[i];
    const lessonId = `f2000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
    await insertIgnore(
      `INSERT IGNORE INTO lessons (id, topic_id, title, sequence_order, content_type, text_content, duration_seconds, is_offline_downloadable)
       VALUES (?, ?, ?, ?, 'text', ?, 360, TRUE)`,
      [lessonId, topicId, title, order, text]
    );
  }

  await insertIgnore(
    `INSERT IGNORE INTO question_banks (id, subject_id, title, created_by) VALUES
     (?, ?, 'Math 8 Fractions Bank', ?),
     (?, ?, 'Science 8 Force Bank', ?),
     (?, ?, 'English 8 Reading Bank', ?)`,
    [IDS.bankMath, IDS.math, adminId, IDS.bankSci, IDS.science, adminId, IDS.bankEng, IDS.english, adminId]
  );

  const questions = [
    ['q1000000-0000-4000-8000-000000000001', IDS.bankMath, IDS.mathT2, 'mcq', 'beginner', 'What is 1/4 + 2/4?', ['3/4', '2/8', '1/2', '3/8'], '3/4', 'Denominators match, so add numerators: 1 + 2 = 3. Answer 3/4.', 1],
    ['q1000000-0000-4000-8000-000000000002', IDS.bankMath, IDS.mathT2, 'mcq', 'intermediate', 'What is 1/2 + 1/3?', ['2/5', '5/6', '1/6', '3/6'], '5/6', 'LCM of 2 and 3 is 6. 3/6 + 2/6 = 5/6.', 1],
    ['q1000000-0000-4000-8000-000000000003', IDS.bankMath, IDS.mathT1, 'mcq', 'beginner', 'Which fraction is equivalent to 1/2?', ['2/3', '2/4', '3/5', '1/3'], '2/4', 'Multiply numerator and denominator by 2: 1/2 = 2/4.', 1],
    ['q1000000-0000-4000-8000-000000000004', IDS.bankMath, IDS.mathT2, 'true_false', 'beginner', 'When adding 2/7 + 3/7 you add the denominators to get 5/14.', ['True', 'False'], 'False', 'Keep the same denominator. 2/7 + 3/7 = 5/7.', 1],
    ['q1000000-0000-4000-8000-000000000005', IDS.bankMath, IDS.mathT2, 'mcq', 'developing', 'What is 5/6 − 1/6?', ['4/6', '4/0', '6/6', '4/12'], '4/6', 'Subtract numerators: 5 − 1 = 4. Keep 6. 4/6 can simplify to 2/3.', 1],
    ['q1000000-0000-4000-8000-000000000006', IDS.bankSci, IDS.sciT1, 'mcq', 'beginner', 'Force is best described as a:', ['Colour or smell', 'Push or pull', 'Type of food', 'Unit of time'], 'Push or pull', 'Force is a push or a pull that can change motion or shape.', 1],
    ['q1000000-0000-4000-8000-000000000007', IDS.bankSci, IDS.sciT2, 'mcq', 'intermediate', 'Pressure equals:', ['Force × Area', 'Force ÷ Area', 'Area ÷ Force', 'Force + Area'], 'Force ÷ Area', 'Pressure = Force / Area. Smaller area means greater pressure.', 1],
    ['q1000000-0000-4000-8000-000000000008', IDS.bankSci, IDS.sciT2, 'true_false', 'beginner', 'A sharp knife cuts better because it increases pressure by reducing area.', ['True', 'False'], 'True', 'The same force on a smaller area produces higher pressure.', 1],
    ['q1000000-0000-4000-8000-000000000009', IDS.bankSci, IDS.sciT1, 'mcq', 'developing', 'The SI unit of force is the:', ['Kilogram', 'Metre', 'Newton', 'Pascal'], 'Newton', 'Force is measured in newtons (N). Pressure uses pascals.', 1],
    ['q1000000-0000-4000-8000-00000000000a', IDS.bankEng, IDS.engT1, 'mcq', 'beginner', 'In "The Village Library", what did Meena do each week?', ['Closed the library', 'Borrowed one book', 'Sold vegetables', 'Drove the bus'], 'Borrowed one book', 'The passage says she borrowed one book each week.', 1],
    ['q1000000-0000-4000-8000-00000000000b', IDS.bankEng, IDS.engT1, 'mcq', 'intermediate', 'What is the main idea of the passage?', ['Buses are always late', 'Sharing stories can bring people together', 'Libraries should charge money', 'Meena disliked reading'], 'Sharing stories can bring people together', 'Other children came to listen after Meena shared the stories.', 1],
    ['q1000000-0000-4000-8000-00000000000c', IDS.bankEng, IDS.engT1, 'true_false', 'beginner', 'The librarian was unhappy that children came to listen.', ['True', 'False'], 'False', 'The librarian smiled and praised sharing stories.', 1]
  ];

  for (const q of questions) {
    const [id, bankId, topicId, type, difficulty, text, options, answer, explanation, marks] = q;
    await insertIgnore(
      `INSERT IGNORE INTO questions (id, question_bank_id, topic_id, question_type, difficulty, question_text, options_json, correct_answer_json, explanation, marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bankId, topicId, type, difficulty, text, JSON.stringify(options), JSON.stringify(answer), explanation, marks]
    );
  }

  await insertIgnore(
    `INSERT IGNORE INTO assessments (id, subject_id, title, assessment_type, total_marks, duration_minutes, passing_marks, is_offline_allowed, created_by)
     VALUES
     (?, ?, 'Fractions Diagnostic Test', 'diagnostic', 5, 15, 50, TRUE, ?),
     (?, ?, 'Force and Pressure Practice', 'practice', 4, 12, 50, TRUE, ?),
     (?, ?, 'Reading Comprehension Check', 'chapter_test', 3, 10, 50, TRUE, ?)`,
    [IDS.assessMath, IDS.math, adminId, IDS.assessSci, IDS.science, adminId, IDS.assessEng, IDS.english, adminId]
  );

  const links = [
    [IDS.assessMath, 'q1000000-0000-4000-8000-000000000001', 1],
    [IDS.assessMath, 'q1000000-0000-4000-8000-000000000002', 2],
    [IDS.assessMath, 'q1000000-0000-4000-8000-000000000003', 3],
    [IDS.assessMath, 'q1000000-0000-4000-8000-000000000004', 4],
    [IDS.assessMath, 'q1000000-0000-4000-8000-000000000005', 5],
    [IDS.assessSci, 'q1000000-0000-4000-8000-000000000006', 1],
    [IDS.assessSci, 'q1000000-0000-4000-8000-000000000007', 2],
    [IDS.assessSci, 'q1000000-0000-4000-8000-000000000008', 3],
    [IDS.assessSci, 'q1000000-0000-4000-8000-000000000009', 4],
    [IDS.assessEng, 'q1000000-0000-4000-8000-00000000000a', 1],
    [IDS.assessEng, 'q1000000-0000-4000-8000-00000000000b', 2],
    [IDS.assessEng, 'q1000000-0000-4000-8000-00000000000c', 3]
  ];

  for (let i = 0; i < links.length; i += 1) {
    const [assessmentId, questionId, order] = links[i];
    const linkId = `ab000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
    await insertIgnore(
      `INSERT IGNORE INTO assessment_questions (id, assessment_id, question_id, sequence_order, marks)
       VALUES (?, ?, ?, ?, 1)`,
      [linkId, assessmentId, questionId, order]
    );
  }

  console.log('[SEED] Demo users, 3 courses, lessons, and 3 assessments are ready.');
  await ensureClassroomGraph(schoolId, passwordHash);
}

async function ensureClassroomGraph(schoolId, passwordHash) {
  await insertIgnore(
    `INSERT IGNORE INTO classes (id, school_id, name, grade, section, academic_year)
     VALUES (?, ?, 'Class 8-A', '8', 'A', '2026-2027')`,
    [IDS.class8, schoolId]
  );

  const [classRows] = await db.query('SELECT id FROM classes ORDER BY created_at ASC LIMIT 1');
  const classId = classRows[0]?.id || IDS.class8;
  const [teacherRows] = await db.query('SELECT id FROM teachers LIMIT 1');
  const teacherId = teacherRows[0]?.id || IDS.teacher;
  const [subjectRows] = await db.query('SELECT id FROM subjects LIMIT 1');
  const subjectId = subjectRows[0]?.id || IDS.math;

  const [students] = await db.query('SELECT id FROM students');
  for (const student of students) {
    await insertIgnore(
      'INSERT IGNORE INTO class_enrollments (id, class_id, student_id) VALUES (?, ?, ?)',
      [`e${student.id.slice(1)}`, classId, student.id]
    );
    await insertIgnore(
      `INSERT IGNORE INTO teacher_student_relationships (id, teacher_id, student_id, class_id, subject_id)
       VALUES (?, ?, ?, ?, ?)`,
      [`r${student.id.slice(1)}`, teacherId, student.id, classId, subjectId]
    );
  }

  if (subjectId) {
    await insertIgnore(
      `INSERT IGNORE INTO assignments (id, class_id, teacher_id, subject_id, title, description, due_date, max_marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, 20)`,
      [
        IDS.assignment1,
        classId,
        teacherId,
        subjectId,
        'Fractions practice worksheet',
        'Solve 5 fraction problems in your notebook and write one real-life example.',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ]
    );
  }

  await insertIgnore(
    `INSERT IGNORE INTO users (id, school_id, username, email, password_hash, role, first_name, last_name)
     VALUES (?, ?, 'parent1', 'parent1@ruraledu.org', ?, 'parent', 'Lakshmi', 'Selvam')`,
    [IDS.parentUser, schoolId, passwordHash]
  );
  await insertIgnore(
    'INSERT IGNORE INTO parents (id, user_id, occupation) VALUES (?, ?, ?)',
    [IDS.parent, IDS.parentUser, 'Farmer']
  );
  await insertIgnore(
    `INSERT IGNORE INTO parent_student_relationships (id, parent_id, student_id, relationship_type)
     VALUES (?, ?, ?, 'mother')`,
    [IDS.parentRel, IDS.parent, IDS.student]
  );

  await ensureAdaptivePath();
  console.log('[SEED] Classroom graph, homework, and parent link are ready.');
}

async function ensureAdaptivePath() {
  const [topicRows] = await db.query('SELECT id FROM topics');
  const topicIds = new Set(topicRows.map((row) => row.id));
  const masteryPlan = [
    [IDS.mathT2, 32, 3, 1, 'needs_remediation'],
    [IDS.mathT1, 60, 2, 1, 'developing'],
    [IDS.sciT1, 88, 2, 2, 'mastered'],
    [IDS.sciT2, 42, 2, 1, 'needs_remediation'],
    [IDS.engT1, 40, 2, 1, 'needs_remediation']
  ].filter(([topicId]) => topicIds.has(topicId));

  const recPlan = [
    [IDS.mathT2, 'practice_set', 'high', 'Fractions diagnostic is ready. Take this assessment so the adaptive path can keep you on unlike fractions.'],
    [IDS.mathT2, 'remedial_lesson', 'high', 'Mastery in adding unlike fractions is 32%. Review the lesson, then retake the diagnostic.'],
    [IDS.sciT2, 'practice_set', 'high', 'Pressure looks weak. Take the Force and Pressure practice set next.'],
    [IDS.engT1, 'practice_set', 'medium', 'Reading comprehension check will measure the Village Library passage.'],
    [IDS.sciT1, 'next_topic', 'low', 'Force is mastered. Continue to Pressure after you finish the science practice set.']
  ].filter(([topicId]) => topicIds.has(topicId));

  const [students] = await db.query('SELECT id FROM students');
  for (const student of students) {
    for (const [topicId, pct, attempts, success, status] of masteryPlan) {
      await insertIgnore(
        `INSERT IGNORE INTO topic_mastery (id, student_id, topic_id, mastery_percentage, total_attempts, successful_attempts, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [stableUuid(`${student.id}:mastery:${topicId}`), student.id, topicId, pct, attempts, success, status]
      );
    }
    for (const [topicId, type, priority, reason] of recPlan) {
      await insertIgnore(
        `INSERT IGNORE INTO recommendations (id, student_id, topic_id, recommendation_type, reason, priority)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [stableUuid(`${student.id}:rec:${type}:${topicId}`), student.id, topicId, type, reason, priority]
      );
    }
  }

  console.log('[SEED] Adaptive mastery, recommendations, and practice assessments are ready.');
}

module.exports = { seedDemoContent, IDS };
