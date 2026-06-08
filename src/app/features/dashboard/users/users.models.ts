export type MemberCategory = 'child' | 'volunteer' | 'collaborator';
export type MemberFilter = MemberCategory | 'all';
export type PortalRole = 'buyer' | 'manager' | 'publisher' | 'none';

export interface UserMember {
  id: number;
  fullName: string;
  phone: string;
  category: MemberCategory;
  portalRole: PortalRole;
  isDefault: boolean;
  address?: string;
  notes?: string;
}

export interface CreateMemberPayload {
  fullName: string;
  phone: string;
  category: MemberCategory;
  portalRole: PortalRole;
  address: string;
  notes: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}
