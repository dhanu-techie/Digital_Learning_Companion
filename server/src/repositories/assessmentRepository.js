const db = require('../config/db');

class AssessmentRepository {
  async findAllAssessments(filters = {}) {
    let sql = `SELECT a.*, s.name as subject_name 
               FROM assessments a 
               JOIN subjects s ON a.subject_id = s.id WHERE 1=1`;
    const params = [];

    if (filters.subjectId) {
      sql += ` AND a.subject_id = ?`;
      params.push(filters.subjectId);
    }

    if (filters.type) {
      sql += ` AND a.assessment_type = ?`;
      params.push(filters.type);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async findAssessmentById(id) {
    const [rows] = await db.query(
      `SELECT a.*, s.name as subject_name 
       FROM assessments a 
       JOIN subjects s ON a.subject_id = s.id 
       WHERE a.id = ?`,
      [id]
    );

    if (!rows[0]) return null;
    const assessment = rows[0];

    const [questions] = await db.query(
      `SELECT q.id, q.question_type, q.difficulty, q.question_text, q.options_json, q.marks, q.explanation, q.topic_id, q.correct_answer_json
       FROM assessment_questions aq
       JOIN questions q ON aq.question_id = q.id
       WHERE aq.assessment_id = ?
       ORDER BY aq.sequence_order ASC`,
      [id]
    );

    assessment.questions = questions;
    return assessment;
  }

  async recordAttempt(attemptData) {
    const { id, assessmentId, studentId, startedAt, completedAt, scoreObtained, totalMarks, percentage, isPassed, isCompletedOffline } = attemptData;
    await db.query(
      `INSERT INTO assessment_attempts (id, assessment_id, student_id, started_at, completed_at, score_obtained, total_marks, percentage, is_passed, is_completed_offline, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, assessmentId, studentId, startedAt, completedAt, scoreObtained, totalMarks, percentage, isPassed, isCompletedOffline ? 1 : 0]
    );
  }

  async recordAnswers(answers) {
    if (!answers || answers.length === 0) return;
    for (const a of answers) {
      await db.query(
        `INSERT INTO assessment_answers (id, attempt_id, question_id, given_answer_json, is_correct, marks_awarded, time_taken_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.attemptId,
          a.questionId,
          JSON.stringify(a.givenAnswerJson),
          a.isCorrect ? 1 : 0,
          a.marksAwarded,
          a.timeTakenSeconds
        ]
      );
    }
  }

  async findAttemptsByStudentId(studentId) {
    const [rows] = await db.query(
      `SELECT aa.*, a.title as assessment_title, a.assessment_type
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.student_id = ?
       ORDER BY aa.started_at DESC`,
      [studentId]
    );
    return rows;
  }
}

module.exports = new AssessmentRepository();
