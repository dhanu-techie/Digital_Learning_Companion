const db = require('../config/db');

class DoubtRepository {
  async createDoubt(doubtData) {
    const { id, studentId, teacherId, subjectId, topicId, title } = doubtData;
    await db.query(
      `INSERT INTO doubts (id, student_id, teacher_id, subject_id, topic_id, title)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, studentId, teacherId, subjectId, topicId || null, title]
    );
    return this.findDoubtById(id);
  }

  async addMessage(msgData) {
    const { id, doubtId, senderId, senderRole, messageText, voiceNoteUrl, attachmentUrl } = msgData;
    await db.query(
      `INSERT INTO doubt_messages (id, doubt_id, sender_id, sender_role, message_text, voice_note_url, attachment_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, doubtId, senderId, senderRole, messageText || null, voiceNoteUrl || null, attachmentUrl || null]
    );

    // Update doubt timestamp
    await db.query(`UPDATE doubts SET updated_at = NOW() WHERE id = ?`, [doubtId]);
  }

  async findDoubtById(id) {
    const [rows] = await db.query(
      `SELECT d.*, s.name as subject_title 
       FROM doubts d 
       JOIN subjects s ON d.subject_id = s.id 
       WHERE d.id = ?`,
      [id]
    );

    if (!rows[0]) return null;
    const doubt = rows[0];

    const [messages] = await db.query(
      `SELECT m.*, u.first_name, u.last_name, u.role
       FROM doubt_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.doubt_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    doubt.messages = messages;
    return doubt;
  }

  async findDoubtsByStudent(studentId) {
    const [rows] = await db.query(
      `SELECT d.*, s.name as subject_title, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM doubts d
       JOIN subjects s ON d.subject_id = s.id
       JOIN teachers t ON d.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE d.student_id = ?
       ORDER BY d.updated_at DESC`,
      [studentId]
    );
    return rows;
  }

  async findDoubtsByTeacher(teacherId) {
    const [rows] = await db.query(
      `SELECT d.*, s.name as subject_title, u.first_name as student_first_name, u.last_name as student_last_name
       FROM doubts d
       JOIN subjects s ON d.subject_id = s.id
       JOIN students st ON d.student_id = st.id
       JOIN users u ON st.user_id = u.id
       WHERE d.teacher_id = ?
       ORDER BY d.updated_at DESC`,
      [teacherId]
    );
    return rows;
  }
}

module.exports = new DoubtRepository();
