export interface UserAssignment {
  id: string;
  branch_id: string | null;
  branch_name: string | null;
  role: string;
  is_primary: boolean;
  is_active: boolean;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string | null;
  profile_picture: string | null;
  date_of_birth: string | null;
  gender: 'Male' | 'Female' | 'Prefer not to say' | null;
  status: 'Pending' | 'Active' | 'Suspended' | 'Archived';
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  assignments: UserAssignment[];
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state_region: string | null;
  country: string;
  status: 'Active' | 'Inactive' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor: { id: string; email: string; full_name: string } | null;
  branch: { id: string; name: string; code: string } | null;
}

export interface Assignment {
  id: string;
  user: { id: string; email: string; full_name: string } | null;
  branch: { id: string; name: string; code: string } | null;
  role: string;
  is_primary: boolean;
  is_active: boolean;
  assigned_by: { id: string; email: string; full_name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  branch_id: string;
  role?: string;
}

export interface CreateBranchManagerRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  branch_id: string;
}
