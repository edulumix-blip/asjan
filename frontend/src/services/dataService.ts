import api from '../config/api';

// Jobs
export const jobService = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getStats: () => api.get('/jobs/stats'),
  getFilterOptions: () => api.get('/jobs/filter-options'),
  getGrouped: () => api.get('/jobs/grouped'),
  getById: (id: string) => api.get(`/jobs/${id}`),
  getBySlug: (slug: string) => api.get(`/jobs/slug/${slug}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  like: (id: string) => api.put(`/jobs/${id}/like`),
  getMyJobs: () => api.get('/jobs/my/jobs'),
  fetchExternal: (opts?: any) => api.post('/jobs/fetch-external', opts || {}),
};

// Resources
export const resourceService = {
  getAll: (params?: any) => api.get('/resources', { params }),
  getFilterOptions: () => api.get('/resources/filter-options'),
  getGrouped: () => api.get('/resources/grouped'),
  getById: (id: string) => api.get(`/resources/${id}`),
  getFullContent: (id: string) => api.get(`/resources/${id}/full-content`),
  create: (data: any) => api.post('/resources', data),
  update: (id: string, data: any) => api.put(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
  like: (id: string) => api.put(`/resources/${id}/like`),
  download: (id: string) => api.put(`/resources/${id}/download`),
  getMyResources: () => api.get('/resources/my/resources'),
};

// Blogs
export const blogService = {
  getAll: (params?: any) => api.get('/blogs', { params }),
  getAllAdmin: (params?: any) => api.get('/blogs/all', { params }),
  getFeatured: () => api.get('/blogs/featured'),
  getBySlug: (slug: string) => api.get(`/blogs/${slug}`),
  create: (data: any) => api.post('/blogs', data),
  update: (id: string, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
  like: (id: string) => api.put(`/blogs/${id}/like`),
  getMyBlogs: () => api.get('/blogs/my/blogs'),
  getFullContent: (id: string) => api.get(`/blogs/${id}/full-content`),
};

// Products
export const productService = {
  getAll: (params?: any) => api.get('/products', { params }),
  getFilterOptions: () => api.get('/products/filter-options'),
  getAllAdmin: (params?: any) => api.get('/products/all', { params }),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/my/products'),
  getCount: () => api.get('/products/count'),
  toggleAvailability: (id: string) => api.put(`/products/${id}/toggle-availability`),
  toggleFeatured: (id: string) => api.put(`/products/${id}/toggle-featured`),
};

// Courses
export const courseService = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getFilterOptions: () => api.get('/courses/filter-options'),
  getAllAdmin: (params?: any) => api.get('/courses/all', { params }),
  getFeatured: () => api.get('/courses/featured'),
  getBySlug: (slug: string) => api.get(`/courses/${slug}`),
  getById: (id: string) => api.get(`/courses/id/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  togglePublish: (id: string) => api.put(`/courses/${id}/toggle-publish`),
  toggleFeatured: (id: string) => api.put(`/courses/${id}/toggle-featured`),
  getCount: () => api.get('/courses/count'),
};

// Mock Tests
export const mockTestService = {
  getAll: (params?: any) => api.get('/mocktests', { params }),
  getFilterOptions: () => api.get('/mocktests/filter-options'),
  getAllAdmin: (params?: any) => api.get('/mocktests/all', { params }),
  getFeatured: () => api.get('/mocktests/featured'),
  getBySlug: (slug: string) => api.get(`/mocktests/${slug}`),
  getById: (id: string) => api.get(`/mocktests/id/${id}`),
  create: (data: any) => api.post('/mocktests', data),
  update: (id: string, data: any) => api.put(`/mocktests/${id}`, data),
  delete: (id: string) => api.delete(`/mocktests/${id}`),
  togglePublish: (id: string) => api.put(`/mocktests/${id}/toggle-publish`),
  toggleFeatured: (id: string) => api.put(`/mocktests/${id}/toggle-featured`),
  submit: (id: string, score: number) => api.post(`/mocktests/${id}/submit`, { score }),
  getCount: () => api.get('/mocktests/count'),
};

// Users (Admin only)
export const userService = {
  getAll: (params?: any) => api.get('/users', { params }),
  getPending: () => api.get('/users/pending'),
  getApproved: () => api.get('/users/approved'),
  getStats: () => api.get('/users/stats'),
  approve: (id: string) => api.put(`/users/${id}/approve`),
  reject: (id: string, reason: string) => api.put(`/users/${id}/reject`, { reason }),
  block: (id: string) => api.put(`/users/${id}/block`),
  unblock: (id: string) => api.put(`/users/${id}/unblock`),
  changeRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Interview Prep
export const interviewPrepService = {
  getAll: (params?: any) => api.get('/interview-prep', { params }),
  getById: (id: string) => api.get(`/interview-prep/${id}`),
  create: (data: any) => api.post('/interview-prep', data),
  update: (id: string, data: any) => api.put(`/interview-prep/${id}`, data),
  delete: (id: string) => api.delete(`/interview-prep/${id}`),
};
