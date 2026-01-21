import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo Users
export const getDemoUsers = () => api.get('/api/demo-users');

// Subjects
export const getSubjects = (params) => api.get('/api/subjects', { params });
export const createSubject = (data) => api.post('/api/subjects', data);

// Exams
export const getExams = (params) => api.get('/api/exams', { params });
export const createExam = (data) => api.post('/api/exams', data);

// Exam Terms
export const getExamTerms = (params) => api.get('/api/exam-terms', { params });
export const createExamTerm = (data) => api.post('/api/exam-terms', data);
export const approveExamTerm = (id, data) => api.put(`/api/exam-terms/${id}`, data);

// Session Periods
export const getSessionPeriods = () => api.get('/api/session-periods');
export const createSessionPeriod = (data) => api.post('/api/session-periods', data);

// Validation
export const checkRoomAvailability = (params) =>
  api.get('/api/exam-terms/validation/check-room', { params });
export const checkStudentAvailability = (params) =>
  api.get('/api/exam-terms/validation/check-students', { params });

// Rooms
export const getRooms = () => api.get('/api/rooms');
export const getRoom = (nazwa) => api.get(`/api/rooms/${nazwa}`);
export const createRoom = (data) => api.post('/api/rooms', data);
export const checkRoomCapacityAndAvailability = (data) =>
  api.post('/api/rooms/check-availability', data);

export default api;
