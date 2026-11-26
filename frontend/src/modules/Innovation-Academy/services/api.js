import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '/api/academy';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem('trace_token')) {
        console.warn('Session expired or unauthorized. Logging out.');
      }
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },
  changePassword: async (passwordData) => {
    const res = await api.put('/auth/password', passwordData);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  verifyResetCode: async (email, code) => {
    const res = await api.post('/auth/verify-reset-code', { email, code });
    return res.data;
  },
  resetPassword: async ({ email, code, newPassword }) => {
    const res = await api.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
  },
};

export const programService = {
  getPrograms: async () => {
    const res = await api.get('/programs');
    return res.data;
  },
  getProgramBySlug: async (slug) => {
    const res = await api.get(`/programs/${slug}`);
    return res.data;
  },
  createProgram: async (data) => {
    const res = await api.post('/programs', data);
    return res.data;
  },
  updateProgram: async (id, data) => {
    const res = await api.put(`/programs/${id}`, data);
    return res.data;
  },
  deleteProgram: async (id) => {
    const res = await api.delete(`/programs/${id}`);
    return res.data;
  },
};

export const workshopService = {
  getWorkshops: async (params = {}) => {
    const res = await api.get('/workshops', { params });
    return res.data;
  },
  getWorkshopBySlug: async (slug) => {
    const res = await api.get(`/workshops/${slug}`);
    return res.data;
  },
  createWorkshop: async (data) => {
    const res = await api.post('/workshops', data);
    return res.data;
  },
  updateWorkshop: async (id, data) => {
    const res = await api.put(`/workshops/${id}`, data);
    return res.data;
  },
  deleteWorkshop: async (id) => {
    const res = await api.delete(`/workshops/${id}`);
    return res.data;
  },
};

export const registrationService = {
  registerProgram: async (data) => {
    const res = await api.post('/registrations', data);
    return res.data;
  },
  getMyRegistrations: async () => {
    const res = await api.get('/registrations/my');
    return res.data;
  },
  checkAccess: async (programSlug) => {
    const res = await api.get(`/registrations/check-access/${programSlug}`);
    return res.data;
  },
  getAllRegistrations: async (params = {}) => {
    const res = await api.get('/registrations', { params });
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.put(`/registrations/${id}/status`, { status });
    return res.data;
  },
  deleteRegistration: async (id) => {
    const res = await api.delete(`/registrations/${id}`);
    return res.data;
  },
};

export const visitService = {
  createVisitRequest: async (data) => {
    const res = await api.post('/visits', data);
    return res.data;
  },
  getMyVisitRequests: async () => {
    const res = await api.get('/visits/my');
    return res.data;
  },
  getAllVisitRequests: async (params = {}) => {
    const res = await api.get('/visits', { params });
    return res.data;
  },
  updateVisitStatus: async (id, data) => {
    const res = await api.put(`/visits/${id}`, data);
    return res.data;
  },
};

export const contactService = {
  submitContact: async (data) => {
    const res = await api.post('/contact', data);
    return res.data;
  },
  getMyMessages: async () => {
    const res = await api.get('/contact/my-messages');
    return res.data;
  },
  replyMessage: async (id, replyMessage, extra = {}) => {
    try {
      const res = await api.post(`/contact/${id}/reply`, { replyMessage, ...extra });
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Fallback for servers running process before route hot-reload
        const fallbackRes = await api.post('/contact', {
          name: extra.name || 'TRACE Participant',
          email: extra.email || 'participant@trace.lk',
          userId: extra.userId || null,
          subject: extra.subject || 'Follow-up Reply to TRACE Secretariat',
          programOfInterest: extra.programOfInterest || '',
          message: `[Follow-up Reply]: ${replyMessage}`,
        });
        return {
          success: true,
          data: fallbackRes.data?.data,
          message: 'Your reply has been sent to TRACE Secretariat!',
        };
      }
      throw err;
    }
  },
  getAllMessages: async (params = {}) => {
    const res = await api.get('/contact', { params });
    return res.data;
  },
  updateMessageStatus: async (id, data) => {
    const res = await api.put(`/contact/${id}`, data);
    return res.data;
  },
  deleteMessage: async (id) => {
    const res = await api.delete(`/contact/${id}`);
    return res.data;
  },
};

export const userService = {
  getAdminStats: async () => {
    const res = await api.get('/users/admin-stats');
    return res.data;
  },
  getParticipants: async () => {
    const res = await api.get('/users/participants');
    return res.data;
  },
  deleteParticipant: async (id) => {
    const res = await api.delete(`/users/participants/${id}`);
    return res.data;
  },
  updateParticipantRole: async (id, role) => {
    const res = await api.put(`/users/participants/${id}/role`, { role });
    return res.data;
  },
  getParticipantOverview: async () => {
    const res = await api.get('/users/participant-overview');
    return res.data;
  },
  getNotifications: async () => {
    const res = await api.get('/users/notifications');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await api.put(`/users/notifications/${id}/read`);
    return res.data;
  },
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default api;

