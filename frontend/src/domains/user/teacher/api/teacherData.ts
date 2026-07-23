import {
  fetchEnrollmentsPaginatedApi,
  fetchStudentsApi,
  fetchClassesApi,
} from '@/domains/learning/academics/api/academicApi';
import { fetchAllPages } from '@/shared/api/pagination';
import type { AcademicClass, Enrollment, StudentProfile } from '@/shared/types';

export type TeacherClassOption = { id: string; name: string };

export type TeacherDashboardData = {
  mode: 'staff' | 'instructor';
  enrollments: Enrollment[];
  students: StudentProfile[];
  classes: TeacherClassOption[];
  selectedClassId: string;
};

function uniqueClassesFromEnrollments(enrollments: Enrollment[]): TeacherClassOption[] {
  const map = new Map<string, string>();
  enrollments.forEach(e => {
    if (e.enrolled_class) map.set(e.enrolled_class, e.class_name || 'Class');
  });
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

function normalizeStatus(status?: string | null) {
  return String(status || '').trim().toUpperCase();
}

function studentsFromEnrollments(enrollments: Enrollment[]): StudentProfile[] {
  const byId = new Map<string, StudentProfile>();
  enrollments.forEach(enrollment => {
    if (!enrollment.student || byId.has(enrollment.student)) return;
    const studentName = enrollment.student_name || enrollment.student_email || 'Student';
    const parts = studentName.split(' ');
    byId.set(enrollment.student, {
      id: enrollment.student,
      first_name: parts[0] || studentName,
      last_name: parts.slice(1).join(' ') || '',
      email: enrollment.student_email || '',
      is_active: !['CANCELLED', 'REJECTED'].includes(normalizeStatus(enrollment.status)),
    } as StudentProfile);
  });
  return Array.from(byId.values());
}

export async function loadTeacherDashboardData(
  role?: string,
  currentUserId?: string,
): Promise<TeacherDashboardData> {
  const isAdminOrStaff = role === 'Admin' || role === 'Manager' || role === 'Secretary';

  if (isAdminOrStaff) {
    const [enrollments, students, classesRaw] = await Promise.all([
      fetchAllPages((p) => fetchEnrollmentsPaginatedApi(p)).catch(() => [] as Enrollment[]),
      fetchStudentsApi().catch(() => [] as StudentProfile[]),
      fetchClassesApi().catch(() => [] as AcademicClass[]),
    ]);

    const classes: TeacherClassOption[] = (classesRaw as AcademicClass[]).map(c => ({
      id: c.id,
      name: c.name,
    }));
    const classIds = new Set(classes.map(c => c.id));
    uniqueClassesFromEnrollments(enrollments).forEach(c => {
      if (!classIds.has(c.id)) classes.push(c);
    });

    const selectedClassId =
      enrollments.find(e => e.status === 'ACTIVE')?.enrolled_class ||
      classes[0]?.id ||
      '';

    return {
      mode: 'staff',
      enrollments,
      students,
      classes,
      selectedClassId,
    };
  }

  const [classesRaw, enrollments] = await Promise.all([
    fetchClassesApi().catch(() => [] as AcademicClass[]),
    fetchAllPages((p) => fetchEnrollmentsPaginatedApi(p)).catch(() => [] as Enrollment[]),
  ]);
  const classes: TeacherClassOption[] = (classesRaw as AcademicClass[])
    .filter(c => c.is_active !== false)
    .map(c => ({ id: c.id, name: c.name }));

  const classIds = new Set(classes.map(c => c.id));
  uniqueClassesFromEnrollments(enrollments).forEach(c => {
    if (!classIds.has(c.id)) classes.push(c);
  });

  const selectedClassId =
    enrollments.find(e => !['CANCELLED', 'REJECTED'].includes(normalizeStatus(e.status)))?.enrolled_class ||
    classes[0]?.id ||
    '';

  return {
    mode: 'instructor',
    enrollments,
    students: studentsFromEnrollments(enrollments),
    classes,
    selectedClassId,
  };
}

export async function loadClassRoster(
  mode: 'staff' | 'instructor',
  classId: string,
  allEnrollments: Enrollment[],
  allStudents: StudentProfile[],
  currentUserId?: string,
): Promise<{ enrollments: Enrollment[]; students: StudentProfile[] }> {
  if (!classId) return { enrollments: [], students: [] };

  if (mode === 'staff') {
    const filtered = allEnrollments.filter(
      e => e.enrolled_class === classId && normalizeStatus(e.status) === 'ACTIVE',
    );
    const studentIds = new Set(filtered.map(e => e.student));
    return {
      enrollments: filtered,
      students: allStudents.filter(s => studentIds.has(s.id)),
    };
  }

  const filtered = allEnrollments.filter(
    e => e.enrolled_class === classId && normalizeStatus(e.status) === 'ACTIVE',
  );
  return {
    enrollments: filtered,
    students: studentsFromEnrollments(filtered),
  };
}
