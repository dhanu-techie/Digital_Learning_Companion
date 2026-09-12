const db = require('../config/db');

class CourseRepository {
  async findAllCourses(filters = {}) {
    let sql = `SELECT c.*, s.name as subject_name, s.grade
               FROM courses c
               JOIN subjects s ON c.subject_id = s.id
               WHERE c.is_published = TRUE`;
    const params = [];

    if (filters.grade) {
      sql += ` AND s.grade = ?`;
      params.push(filters.grade);
    }

    if (filters.subjectId) {
      sql += ` AND c.subject_id = ?`;
      params.push(filters.subjectId);
    }

    sql += ` ORDER BY c.created_at DESC`;
    const [rows] = await db.query(sql, params);
    return rows;
  }

  async findCourseByIdWithHierarchy(courseId) {
    const [courseRows] = await db.query(
      `SELECT c.*, s.name as subject_name, s.grade 
       FROM courses c 
       JOIN subjects s ON c.subject_id = s.id 
       WHERE c.id = ?`,
      [courseId]
    );

    if (!courseRows[0]) return null;
    const course = courseRows[0];

    const [chapters] = await db.query(
      `SELECT * FROM chapters WHERE course_id = ? ORDER BY sequence_order ASC`,
      [courseId]
    );

    for (let chapter of chapters) {
      const [topics] = await db.query(
        `SELECT * FROM topics WHERE chapter_id = ? ORDER BY sequence_order ASC`,
        [chapter.id]
      );

      for (let topic of topics) {
        const [lessons] = await db.query(
          `SELECT * FROM lessons WHERE topic_id = ? ORDER BY sequence_order ASC`,
          [topic.id]
        );
        topic.lessons = lessons;
      }
      chapter.topics = topics;
    }

    course.chapters = chapters;
    return course;
  }

  async getDownloadPackage(courseId) {
    const course = await this.findCourseByIdWithHierarchy(courseId);
    if (!course) return null;

    // Fetch related questions for offline practice
    const [questions] = await db.query(
      `SELECT q.id, q.question_type, q.difficulty, q.question_text, q.options_json, q.explanation, q.topic_id
       FROM questions q
       JOIN topics t ON q.topic_id = t.id
       JOIN chapters ch ON t.chapter_id = ch.id
       WHERE ch.course_id = ?`,
      [courseId]
    );

    return {
      course,
      offlineQuestions: questions,
      packageVersion: course.version,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new CourseRepository();
