/**
 * API Service for Backend Communication
 * Handles all HTTP requests to the dental backend API
 */

// API Base URL - hardcoded for development
// In production, this can be changed to use environment variables
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Measurement {
  id?: string;
  measurementId?: string;
  patientId: string;
  studyInstanceUID: string;
  type: string;
  label: string;
  value: number;
  unit: string;
  toothNumber?: {
    universal: number;
    fdi: string;
  };
  timestamp: string;
  metadata?: any;
}

export interface ViewerState {
  patientId?: string;
  studyInstanceUID?: string;
  theme: string;
  selectedTeeth: any[];
  viewportSettings?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// ============================================================================
// Token Management
// ============================================================================

class TokenManager {
  private static TOKEN_KEY = 'dental_jwt_token';
  private static USER_KEY = 'dental_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// ============================================================================
// HTTP Client
// ============================================================================

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = TokenManager.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T = any>(
    endpoint: string,
    body: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      includeAuth
    );
  }

  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }
}

// ============================================================================
// API Service
// ============================================================================

class ApiService {
  private http: HttpClient;

  constructor(baseURL: string = API_BASE_URL) {
    this.http = new HttpClient(baseURL);
  }

  // ==========================================================================
  // Authentication
  // ==========================================================================

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    role: string = 'dentist'
  ): Promise<AuthResponse> {
    const response = await this.http.post<{ user: User; token: string }>(
      '/auth/register',
      { email, password, fullName, role },
      false // No auth needed for registration
    );

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      TokenManager.setUser(response.data.user);
    }

    return response as AuthResponse;
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.http.post<{ user: User; token: string }>(
      '/auth/login',
      { email, password },
      false // No auth needed for login
    );

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      TokenManager.setUser(response.data.user);
    }

    return response as AuthResponse;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.http.get<{ user: User }>('/auth/me');
  }

  /**
   * Logout user
   */
  logout(): void {
    TokenManager.removeToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUserLocal(): User | null {
    return TokenManager.getUser();
  }

  // ==========================================================================
  // Measurements
  // ==========================================================================

  /**
   * Get all measurements (with optional filters)
   */
  async getMeasurements(
    patientId?: string,
    studyInstanceUID?: string
  ): Promise<ApiResponse<{ measurements: Measurement[] }>> {
    let endpoint = '/measurements';
    const params = new URLSearchParams();

    if (patientId) params.append('patientId', patientId);
    if (studyInstanceUID) params.append('studyInstanceUID', studyInstanceUID);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.http.get<{ measurements: Measurement[] }>(endpoint);
  }

  /**
   * Create a single measurement
   */
  async createMeasurement(measurement: Measurement): Promise<ApiResponse<{ id: string; dbId: number }>> {
    return this.http.post<{ id: string; dbId: number }>('/measurements', {
      measurementId: measurement.id || measurement.measurementId,
      patientId: measurement.patientId,
      studyInstanceUID: measurement.studyInstanceUID,
      type: measurement.type,
      label: measurement.label,
      value: measurement.value,
      unit: measurement.unit,
      toothNumber: measurement.toothNumber,
      timestamp: measurement.timestamp,
      metadata: measurement.metadata,
    });
  }

  /**
   * Bulk create measurements
   */
  async bulkCreateMeasurements(
    measurements: Measurement[]
  ): Promise<ApiResponse<{ insertedCount: number; totalSubmitted: number }>> {
    return this.http.post<{ insertedCount: number; totalSubmitted: number }>(
      '/measurements/bulk',
      { measurements }
    );
  }

  /**
   * Delete a measurement by ID
   */
  async deleteMeasurement(measurementId: string): Promise<ApiResponse> {
    return this.http.delete(`/measurements/${measurementId}`);
  }

  /**
   * Delete all measurements for a study
   */
  async deleteStudyMeasurements(studyInstanceUID: string): Promise<ApiResponse> {
    return this.http.delete(`/measurements/study/${studyInstanceUID}`);
  }

  // ==========================================================================
  // Viewer State
  // ==========================================================================

  /**
   * Get viewer state
   */
  async getViewerState(
    patientId?: string,
    studyInstanceUID?: string
  ): Promise<ApiResponse<{ state: ViewerState }>> {
    let endpoint = '/viewer-state';
    const params = new URLSearchParams();

    if (patientId) params.append('patientId', patientId);
    if (studyInstanceUID) params.append('studyInstanceUID', studyInstanceUID);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.http.get<{ state: ViewerState }>(endpoint);
  }

  /**
   * Save viewer state
   */
  async saveViewerState(state: ViewerState): Promise<ApiResponse<{ id: number }>> {
    return this.http.post<{ id: number }>('/viewer-state', state);
  }

  /**
   * Delete viewer state
   */
  async deleteViewerState(patientId?: string, studyInstanceUID?: string): Promise<ApiResponse> {
    let endpoint = '/viewer-state';
    const params = new URLSearchParams();

    if (patientId) params.append('patientId', patientId);
    if (studyInstanceUID) params.append('studyInstanceUID', studyInstanceUID);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.http.delete(endpoint);
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Check if backend is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

const apiService = new ApiService();

export default apiService;
export { TokenManager, ApiService };
