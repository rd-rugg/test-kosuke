export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  linkedinUrl?: string;
  tags: string[];
  priority: 1 | 2 | 3;
  notes: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}


