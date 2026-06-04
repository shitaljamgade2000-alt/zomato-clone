const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// export async function apiRequest(endpoint, options = {}) {
//   const token = localStorage.getItem('token');
//   const headers = {
//     'Content-Type': 'application/json',
//     ...options.headers,
//   };

//   if (token) headers.Authorization = `Bearer ${token}`;

//   const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

//   let data = {};
//   const text = await response.text();
//   if (text) {
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { message: text };
//     }
//   }

//   if (!response.ok) {
//     throw new ApiError(data.message || 'Request failed', response.status, data);
//   }

//   return data;
// }

export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}