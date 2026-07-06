export const APP_NAME = 'Ethio Robotics';
export const APP_TAGLINE = 'Building Future Engineers Through Real Robots';

export const BRAND = {
  blue: '#25338d',
  red: '#ed1c24',
  cyan: '#57dffe',
  dark: '#101426',
  bg: '#f7f8ff',
} as const;

export const ROLES = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
  PARENT: 'Parent',
  EVENT_MANAGER: 'EventManager',
} as const;

export const MOCK_CREDENTIALS = [
  { email: 'student@gmail.com', password: 'student1234', role: 'Student' },
  { email: 'teacher@gmail.com', password: 'teacher123', role: 'Instructor' },
  { email: 'manager@gmail.com', password: 'manager123', role: 'Manager' },
] as const;
