import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://staging-api.queuetoken.in",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pulse_admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("pulse_admin_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints
export const API = {
  // Dashboard
  dashboard: {
    metrics: () => "/dashboard/metrics",
    charts: () => "/dashboard/charts",
    activity: () => "/dashboard/activity",
  },
  // Doctors
  doctors: {
    list: () => "/doctors",
    detail: (id: string) => `/doctors/${id}`,
    create: () => "/doctors",
    update: (id: string) => `/doctors/${id}`,
    verify: (id: string) => `/doctors/${id}/verify`,
    suspend: (id: string) => `/doctors/${id}/suspend`,
  },
  // Clinics
  clinics: {
    list: () => "/clinics",
    detail: (id: string) => `/clinics/${id}`,
    create: () => "/clinics",
    update: (id: string) => `/clinics/${id}`,
  },
  // Patients
  patients: {
    list: () => "/patients",
    detail: (id: string) => `/patients/${id}`,
    block: (id: string) => `/patients/${id}/block`,
    unblock: (id: string) => `/patients/${id}/unblock`,
  },
  // Appointments
  appointments: {
    list: () => "/appointments",
    detail: (id: string) => `/appointments/${id}`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
    complete: (id: string) => `/appointments/${id}/complete`,
  },
  // Queue
  queue: {
    list: () => "/queue",
    next: (id: string) => `/queue/${id}/next`,
    skip: (id: string) => `/queue/${id}/skip`,
    pause: (id: string) => `/queue/${id}/pause`,
    resume: (id: string) => `/queue/${id}/resume`,
  },
  // Verification
  verification: {
    list: () => "/verification",
    approve: (id: string) => `/verification/${id}/approve`,
    reject: (id: string) => `/verification/${id}/reject`,
    requestReupload: (id: string) => `/verification/${id}/reupload`,
  },
  // Payments
  payments: {
    list: () => "/payments",
    payout: () => "/payments/payout",
    revenue: () => "/payments/revenue",
  },
  // Reviews
  reviews: {
    list: () => "/reviews",
    hide: (id: string) => `/reviews/${id}/hide`,
    flag: (id: string) => `/reviews/${id}/flag`,
    resolve: (id: string) => `/reviews/${id}/resolve`,
  },
  // Notifications
  notifications: {
    list: () => "/notifications",
    send: () => "/notifications/broadcast",
  },
  // Support
  support: {
    list: () => "/support/tickets",
    detail: (id: string) => `/support/tickets/${id}`,
    assign: (id: string) => `/support/tickets/${id}/assign`,
    resolve: (id: string) => `/support/tickets/${id}/resolve`,
  },
};
