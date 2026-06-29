// CivicAI Frontend API Integration Layer
// Replaces static localStorage mock data with real Express API requests

export interface Creator {
  name: string;
  avatar: string;
  rank: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
}

export interface TimelineEvent {
  status: 'reported' | 'verified' | 'in-progress' | 'resolved';
  title: string;
  description: string;
  timestamp: string;
  updatedBy?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'verified' | 'in-progress' | 'resolved';
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  upvotes: number;
  verifiedCount: number;
  creator: Creator;
  createdAt: string;
  timeline: TimelineEvent[];
  comments: Comment[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned: string;
}

export interface UserStats {
  id?: string;
  name: string;
  avatar: string;
  points: number;
  rank: string;
  issuesReported: number;
  issuesResolved: number;
  verificationsCount: number;
  badges: Badge[];
  role?: 'citizen' | 'staff' | 'admin';
}

export interface Notification {
  id: string;
  type: 'status_change' | 'verification' | 'comment' | 'badge_earned';
  title: string;
  message: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  reports: number;
  verifications: number;
  avatar: string;
}

// ==========================================
// API UTILITIES
// ==========================================

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const isServer = typeof window === 'undefined';

export function getAuthToken(): string | null {
  if (isServer) return null;
  return localStorage.getItem('civicai_token');
}

export function setAuthToken(token: string | null) {
  if (isServer) return;
  if (token) {
    localStorage.setItem('civicai_token', token);
  } else {
    localStorage.removeItem('civicai_token');
  }
}

export function clearSession() {
  if (isServer) return;
  localStorage.removeItem('civicai_token');
  localStorage.removeItem('civicai_user_profile');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export async function loginUser(email: string, password: string): Promise<any> {
  const data = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data?.session?.access_token) {
    setAuthToken(data.session.access_token);
  }
  return data;
}

export async function signupUser(email: string, password: string, fullName: string, locality: string): Promise<any> {
  // Pass full name and automatically seed avatar on signup
  const data = await fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      fullName,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
    })
  });

  if (data?.session?.access_token) {
    setAuthToken(data.session.access_token);
  }
  return data;
}

export async function logoutUser(): Promise<any> {
  try {
    await fetchAPI('/auth/logout', { method: 'POST' });
  } catch (err: any) {
    console.warn('Backend logout failed/ignored:', err.message);
  } finally {
    clearSession();
  }
}

// ==========================================
// ISSUE REPORTING APIs
// ==========================================

export async function getStoredIssues(): Promise<Issue[]> {
  try {
    return await fetchAPI('/reports');
  } catch (err) {
    console.error('Error fetching reports from backend:', err);
    return [];
  }
}

export async function getReportDetails(id: string): Promise<Issue | null> {
  try {
    return await fetchAPI(`/reports/${id}`);
  } catch (err) {
    console.error(`Error fetching report ${id}:`, err);
    return null;
  }
}

export async function addIssue(issueData: {
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { address: string; lat: number; lng: number };
  imageUrl?: string;
}): Promise<Issue> {
  return fetchAPI('/reports', {
    method: 'POST',
    body: JSON.stringify({
      title: issueData.title,
      description: issueData.description,
      categoryName: issueData.category,
      severity: issueData.severity,
      latitude: issueData.location.lat,
      longitude: issueData.location.lng,
      address: issueData.location.address,
      imageUrl: issueData.imageUrl
    })
  });
}

// Add issue with raw image upload (multipart)
export async function addIssueWithImage(formData: FormData): Promise<Issue> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to submit report with image');
  }

  return response.json();
}

export async function upvoteIssue(id: string): Promise<Issue | null> {
  try {
    const { upvotes } = await fetchAPI(`/reports/${id}/vote`, { method: 'POST' });
    const issue = await getReportDetails(id);
    return issue;
  } catch (err) {
    console.error('Error upvoting issue:', err);
    return null;
  }
}

export async function verifyIssue(id: string, comments?: string): Promise<Issue | null> {
  try {
    await fetchAPI(`/reports/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    });
    return await getReportDetails(id);
  } catch (err) {
    console.error('Error verifying issue:', err);
    return null;
  }
}

export async function addComment(id: string, content: string): Promise<Comment | null> {
  try {
    return await fetchAPI(`/reports/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    return null;
  }
}

// ==========================================
// USER PROFILE & gamification STATS
// ==========================================

const getRankFromXP = (xp: number) => {
  if (xp < 100) return 'Local Observer';
  if (xp < 300) return 'Vigilant Citizen';
  if (xp < 600) return 'Community Guardian';
  if (xp < 1000) return 'Safety Champion';
  return 'Eco Warrior';
};

export async function getStoredUser(): Promise<UserStats | null> {
  const token = getAuthToken();
  if (!token) {
    if (!isServer) {
      const cached = localStorage.getItem('civicai_user_profile');
      if (cached) return JSON.parse(cached);
    }
    return null;
  }
  try {
    const data = await fetchAPI('/auth/profile');
    const u = data.user;

    if (!u) return null;

    const stats: UserStats = {
      id: u.id,
      name: u.full_name || 'Citizen',
      avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      points: u.xp || 0,
      rank: getRankFromXP(u.xp || 0),
      issuesReported: u.reports?.length || 0,
      issuesResolved: u.reports?.filter((r: any) => r.status === 'resolved').length || 0,
      verificationsCount: u.verifications?.length || 0,
      badges: u.user_badges?.map((ub: any) => ({
        id: ub.badges.id,
        name: ub.badges.name,
        icon: 'Award',
        description: ub.badges.description,
        dateEarned: new Date(ub.awarded_at).toISOString().split('T')[0]
      })) || [],
      role: u.role
    };

    if (!isServer) {
      localStorage.setItem('civicai_user_profile', JSON.stringify(stats));
    }
    return stats;
  } catch (err: any) {
    console.warn('Failed to retrieve profile, using cached profile:', err.message);
    if (!isServer) {
      const cached = localStorage.getItem('civicai_user_profile');
      if (cached) return JSON.parse(cached);
    }
    return null;
  }
}

// ==========================================
// LEADERBOARD standings
// ==========================================

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await fetchAPI('/leaderboard');
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function getStoredNotifications(): Promise<Notification[]> {
  if (!getAuthToken()) return [];
  try {
    return await fetchAPI('/notifications');
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<any> {
  if (!getAuthToken()) return;
  return fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' });
}

// ==========================================
// AI DIAGNOSTIC SCAN
// ==========================================

export async function scanImageWithAI(file: File): Promise<{
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}> {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'AI image diagnostic failed.');
  }

  return response.json();
}

// ==========================================
// ADMIN / STAFF WORKFLOWS
// ==========================================

export async function getAdminAnalytics(): Promise<any> {
  return fetchAPI('/admin/analytics');
}

export async function assignStaffToIssue(issueId: string, staffId: string): Promise<any> {
  return fetchAPI(`/admin/reports/${issueId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ staffId })
  });
}

export async function updateIssueStatus(id: string, status: 'submitted' | 'verified' | 'in_progress' | 'resolved' | 'rejected', comments?: string): Promise<any> {
  return fetchAPI(`/admin/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, comments })
  });
}
