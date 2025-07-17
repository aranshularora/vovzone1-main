export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: 'residential' | 'commercial' | 'hospitality' | 'office' | 'retail';
  roomType?: 'bedroom' | 'kitchen' | 'bathroom' | 'living-room' | 'dining-room' | 'balcony' | 'office' | 'lobby' | 'restaurant' | 'retail-space' | 'other';
  class: 'economical' | 'premium' | 'luxury' | 'ultra-luxury';
  location: string;
  year: number;
  designerId: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt?: Date;
  featured?: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface Designer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  avatar?: string;
  company?: string;
  bio: string;
  specialties: string[];
  projects: string[];
  verified: boolean;
  joinedAt: Date;
  experience?: number;
  completedProjects?: number;
  rating?: string;
  portfolio?: {
    totalProjects: number;
    totalViews: number;
    totalLikes: number;
    avgRating: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'visitor' | 'designer' | 'admin';
  status?: 'pending' | 'approved' | 'rejected';
  appliedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  designer?: Designer;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface DatabaseSchema {
  users: {
    [userId: string]: User;
  };
  projects: {
    [projectId: string]: Project;
  };
  projectImages: {
    [imageId: string]: {
      id: string;
      projectId: string;
      url: string;
      filename: string;
      size: number;
      uploadedAt: Date;
    };
  };
  analytics: {
    [designerId: string]: {
      totalViews: number;
      totalLikes: number;
      monthlyData: Array<{
        month: string;
        views: number;
        likes: number;
        projects: number;
      }>;
    };
  };
}