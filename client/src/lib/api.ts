import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Session
  getSession: () => fetch('/api/session').then(res => res.json()),

  // People
  getPeople: (category?: string, sortBy?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sortBy) params.append('sortBy', sortBy);
    return fetch(`/api/people?${params}`).then(res => res.json());
  },

  getPerson: (id: number) => fetch(`/api/people/${id}`).then(res => res.json()),

  createPerson: (data: any) => 
    apiRequest('POST', '/api/people', data).then(res => res.json()),

  // Ratings
  createRating: (data: any) => {
    const sessionId = localStorage.getItem('facerank_sessionId');
    return fetch('/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId || '',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());
  },

  // Comments
  getComments: (personId: number, sortBy?: string) => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    return fetch(`/api/people/${personId}/comments?${params}`).then(res => res.json());
  },

  createComment: (data: any) => {
    const sessionId = localStorage.getItem('facerank_sessionId');
    return fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId || '',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());
  },

  voteOnComment: (commentId: number, voteType: 'up' | 'down') => {
    const sessionId = localStorage.getItem('facerank_sessionId');
    return fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId || '',
      },
      body: JSON.stringify({ voteType }),
    }).then(res => res.json());
  },

  // FaceMash
  getFaceMashComparison: () => 
    fetch('/api/facemash/comparison').then(res => res.json()),

  submitFaceMashChoice: (winnerId: number, loserId: number) => {
    const sessionId = localStorage.getItem('facerank_sessionId');
    return fetch('/api/facemash/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId || '',
      },
      body: JSON.stringify({ winnerId, loserId }),
    }).then(res => res.json());
  },

  // Rankings
  getTopRankings: (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    return fetch(`/api/rankings/top?${params}`).then(res => res.json());
  },

  getWorstRankings: (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    return fetch(`/api/rankings/worst?${params}`).then(res => res.json());
  },

  // Stats
  getStats: () => fetch('/api/stats').then(res => res.json()),
};
