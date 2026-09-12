const db = require('../config/db');

class AssignmentRepository {
  async createAssignment(data) {
    const { id, classId, teacherId, subjectId, title, description, dueDate, maxMarks, attachmentUrl } = data;
    await db.query(
      `INSERT INTO assignments (id, class_id, teacher_id, subject_id, title, description, due_date, max_marks, attachment_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, classId, teacherId, subjectId, title, description || null, new Date(dueDate), maxMarks || 100, attachmentUrl || null]
    );
    return this.findAssignmentById(id);
  }

  async findAssignmentById(id) {
    const [rows] = await db.query(
      `SELECT a.*, s.name as subject_name, c.name as class_name
       FROM assignments a
       JOIN subjects s ON a.subject_id = s.id
       JOIN classes c ON a.class_id = c.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findAssignmentsByTeacher(teacherId) {
    const [rows] = await db.query(
      `SELECT a.*, s.name as subject_name, c.name as class_name
       FROM assignments a
       JOIN subjects s ON a.subject_id = s.id
       JOIN classes c ON a.class_id = c.id
       WHERE a.teacher_id = ?
       ORDER BY a.due_date ASC`,
      [teacherId]
    );
    return rows;
  }

  async findAssignmentsByStudent(studentId) {
    const [rows] = await db.query(
      `SELECT a.*, s.name as subject_name, sub.status as submission_status, sub.marks_awarded, sub.submitted_at
       FROM assignments a
       JOIN class_enrollments ce ON a.class_id = ce.class_id
       JOIN subjects s ON a.subject_id = s.id
       LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
       WHERE ce.student_id = ?
       ORDER BY a.due_date ASC`,
      [studentId, studentId]
    );
    return rows;
  }

  async submitAssignment(submissionData) {
    const { id, assignmentId, studentId, submissionText, fileAttachmentUrl, submittedAt, isSubmittedOffline } = submissionData;
    await db.query(
      `INSERT INTO assignment_submissions (id, assignment_id, student_id, submission_text, file_attachment_url, submitted_at, is_submitted_offline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
       ON DUPLICATE KEY UPDATE submission_text = VALUES(submission_text), file_attachment_url = VALUES(file_attachment_url), submitted_at = VALUES(submitted_at), status = 'submitted'`,
      [id, assignmentId, studentId, submissionText || null, fileAttachmentUrl || null, new Date(submittedAt || Date.now()), isSubmittedOffline ? 1 : 0]
    );
  }

  async evaluateSubmission(submissionId, marksAwarded, feedback) {
    await db.query(
      `UPDATE assignment_submissions
       SET marks_awarded = ?, teacher_feedback = ?, status = 'evaluated', evaluated_at = NOW()
       WHERE id = ?`,
      [marksAwarded, feedback || null, submissionId]
    );
  }
}

module.exports = new AssignmentRepository();
