
export enum ProjectStatus {
  PENDING = 'PENDING',
  SCOPING = 'SCOPING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export interface Project {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  contactEmail?: string;
  title: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  techStack?: string[];
  showOnLanding?: boolean;
  liveUrl?: string;
  isFreeTrial?: boolean;
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'bank';
  senderName?: string;
  transactionId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'client';
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
