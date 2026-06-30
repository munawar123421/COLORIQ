// API configuration and helper functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    name: string
    role: string
    status: string
  }
}

export interface ApiError {
  detail: string
}

// Login API call
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

// Register API call
export async function register(data: RegisterData): Promise<{ message: string; user: any }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  return response.json()
}

// Get current user
export async function getCurrentUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}

// Logout (client-side)
export function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
  localStorage.removeItem('userId')
  window.location.href = '/'
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken')
}

// Get stored token
export function getToken(): string | null {
  return localStorage.getItem('authToken')
}

// Get user role
export function getUserRole(): string | null {
  return localStorage.getItem('userRole')
}

// Get user ID
export function getUserId(): string | null {
  return localStorage.getItem('userId')
}

// Get user name
export function getUserName(): string | null {
  return localStorage.getItem('userName')
}

// Get user email
export function getUserEmail(): string | null {
  return localStorage.getItem('userEmail')
}

// Profile API calls
export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  status: string
  email_verified: boolean
  created_at: string
  last_login: string | null
  total_uploads: number
  successful_uploads: number
  failed_uploads: number
  success_rate: number
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user profile')
  }

  return response.json()
}

export async function updateUserProfile(token: string, name: string): Promise<{ message: string; user: any }> {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Failed to update profile')
  }

  return response.json()
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Failed to change password')
  }

  return response.json()
}
