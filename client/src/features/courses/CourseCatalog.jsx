import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api/apiClient';
import { offlineStorage } from '../../services/db/indexedDB';
import LessonViewer from './LessonViewer';
import { Download, CheckCircle, Play, FileText } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [downloadedCourseIds, setDownloadedCourseIds] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchCourses();
    checkOfflineStatus();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      if (res.data.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      // Fallback to IndexedDB
      const offline = await offlineStorage.getCourses();
      setCourses(offline || []);
    }
  };

  const checkOfflineStatus = async () => {
    const offline = await offlineStorage.getCourses();
    const ids = new Set(offline.map(c => c.id));
    setDownloadedCourseIds(ids);
  };

  const handleDownload = async (courseId) => {
    setDownloadingId(courseId);
    try {
      const res = await apiClient.get(`/courses/${courseId}/download-package`);
      if (res.data.success) {
        const pkg = res.data.data;
        await offlineStorage.saveCourse(pkg.course);
        setDownloadedCourseIds(prev => new Set(prev).add(courseId));
        alert('Course package downloaded successfully for offline learning!');
      }
    } catch (err) {
      alert('Failed to download course package. Check internet connection.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (selectedCourse) {
    return <LessonViewer course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const isDownloaded = downloadedCourseIds.has(course.id);
          return (
            <div key={course.id} class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span class="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg mb-3">
                  {course.subject_name || 'Mathematics'}
                </span>
                <h3 class="text-lg font-bold text-gray-900 leading-snug">{course.title}</h3>
                <p class="text-xs text-gray-500 mt-2 line-clamp-2">{course.description}</p>
              </div>

              <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                {isDownloaded ? (
                  <span class="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <CheckCircle class="w-4 h-4 mr-1" /> Offline Ready
                  </span>
                ) : (
                  <button
                    onClick={() => handleDownload(course.id)}
                    disabled={downloadingId === course.id}
                    class="inline-flex items-center text-xs font-bold text-gray-700 hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    <Download class="w-4 h-4 mr-1" />
                    {downloadingId === course.id ? 'Downloading...' : 'Download (Offline)'}
                  </button>
                )}

                <button
                  onClick={() => setSelectedCourse(course)}
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Play class="w-3.5 h-3.5" />
                  <span>Start Lesson</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
