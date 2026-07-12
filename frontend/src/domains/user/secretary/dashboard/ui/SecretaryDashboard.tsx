import React, { useState, useEffect } from 'react';
import { UserPlus, Users, DollarSign, Award, FileText, LayoutDashboard, RefreshCw, Shield, Target, BookOpen, Calendar, Search } from 'lucide-react';
import { UserProfile } from '@/src/shared/types';
import { AppLayout } from '@/src/shared/ui/AppLayout';
import { NavItem } from '@/src/shared/ui/Sidebar';
import DashboardCommandCenter from '@/src/shared/ui/DashboardCommandCenter';
import AdminAccount from '@/src/domains/user/shared/ui/AdminAccount';
import RegistrationManager from '@/src/domains/competition/admin/RegistrationManager';
import { fetchEnrollmentsApi, fetchPaymentsApi, fetchStudentCertificatesApi, fetchCertificateTemplatesApi, fetchMilestonesApi, fetchLearningMaterialsApi, fetchEnrollmentPeriodsApi } from '@/src/domains/learning/academics/api/academicApi';

import Overview from './Overview';
import AdmissionsPanel from './AdmissionsPanel';
import EnrollmentsPanel from './EnrollmentsPanel';
import PaymentsPanel from './PaymentsPanel';
import CertificatesPanel from './CertificatesPanel';
import ReportsPanel from './ReportsPanel';
import CertificateManager from '@/src/domains/user/shared/ui/CertificateManager';
import CertificateTemplateManager from './CertificateTemplateManager';
import EnrollmentPeriodsPanel from './EnrollmentPeriodsPanel';
import LearningMaterialsPanel from './LearningMaterialsPanel';
import LearningMilestonesManager from './LearningMilestonesManager';
import StudentDetailPanel from './StudentDetailPanel';

interface Props { currentUser: UserProfile; onLogout: () => void; }

type SectionId = 'overview' | 'admissions' | 'enrollments' | 'payments' | 'certificates' | 'templates' | 'reports' | 'periods' | 'materials' | 'milestones' | 'students' | 'event-registrations' | 'account';

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'admissions', label: 'Admissions', icon: UserPlus, group: 'main' },
  { id: 'enrollments', label: 'Enrollments', icon: Users, group: 'main' },
  { id: 'payments', label: 'Payments', icon: DollarSign, group: 'main' },
  { id: 'certificates', label: 'Certificates', icon: Award, group: 'main' },
  { id: 'templates', label: 'Cert. Templates', icon: Award, group: 'main' },
  { id: 'periods', label: 'Enrollment Periods', icon: Calendar, group: 'main' },
  { id: 'students', label: 'Student Details', icon: Search, group: 'main' },
  { id: 'milestones', label: 'Milestones', icon: Target, group: 'main' },
  { id: 'materials', label: 'Learning Materials', icon: BookOpen, group: 'main' },
  { id: 'event-registrations', label: 'Event Registrations', icon: UserPlus, group: 'main' },
  { id: 'reports', label: 'Reports', icon: FileText, group: 'main' },
  { id: 'account', label: 'Account', icon: Shield, group: 'system' },
];

export default function SecretaryDashboard({ currentUser, onLogout }: Props) {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState([
    { label: 'Pending Payments', value: '—', detail: 'loading...', icon: UserPlus, tone: 'amber' as const },
    { label: 'Active Enrollments', value: '—', detail: 'loading...', icon: Users, tone: 'emerald' as const },
    { label: 'Today\'s Payments', value: '—', detail: 'loading...', icon: DollarSign, tone: 'blue' as const },
    { label: 'Certificates', value: '—', detail: 'loading...', icon: Award, tone: 'emerald' as const },
  ]);

  const refreshSignals = () => {
    setLoading(true);
    const isSecretary = currentUser.role === 'Secretary';
    Promise.allSettled([
      fetchEnrollmentsApi(),
      fetchPaymentsApi(),
      fetchStudentCertificatesApi(),
      fetchCertificateTemplatesApi(),
      isSecretary ? Promise.resolve([]) : fetchMilestonesApi(''),
      isSecretary ? Promise.resolve([]) : fetchLearningMaterialsApi(),
      fetchEnrollmentPeriodsApi(),
    ]).then(([enr, pay, certs, templates, milestones, materials, periods]) => {
      const enrollments = enr.status === 'fulfilled' && Array.isArray(enr.value) ? enr.value : [];
      const payments = pay.status === 'fulfilled' && Array.isArray(pay.value) ? pay.value : [];
      const certificates = certs.status === 'fulfilled' && Array.isArray(certs.value) ? certs.value : [];
      const tpl = templates.status === 'fulfilled' && Array.isArray(templates.value) ? templates.value : [];
      const mls = milestones.status === 'fulfilled' && Array.isArray(milestones.value) ? milestones.value : [];
      const mat = materials.status === 'fulfilled' && Array.isArray(materials.value) ? materials.value : [];
      const per = periods.status === 'fulfilled' && Array.isArray(periods.value) ? periods.value : [];
      const active = enrollments.filter(e => e.status === 'ACTIVE');
      const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING_PAYMENT');
      const todayPay = payments.filter(p =>
        p.payment_date?.startsWith(new Date().toISOString().slice(0, 10))
      );
      setSignals([
        { label: 'Pending Payments', value: String(pendingEnrollments.length), detail: 'awaiting payment', icon: UserPlus, tone: 'amber' },
        { label: 'Active Enrollments', value: String(active.length), detail: 'current students', icon: Users, tone: 'emerald' },
        { label: 'Today\'s Payments', value: String(todayPay.length), detail: 'recorded today', icon: DollarSign, tone: 'blue' },
        { label: 'Certificates Issued', value: String(certificates.length), detail: 'total issued', icon: Award, tone: 'emerald' },
        { label: 'Templates', value: String(tpl.length), detail: 'cert. templates', icon: Award, tone: 'blue' },
        { label: 'Materials', value: String(mat.length), detail: 'learning materials', icon: BookOpen, tone: 'purple' },
        { label: 'Milestones', value: String(mls.length), detail: 'active milestones', icon: Target, tone: 'emerald' },
        { label: 'Periods', value: String(per.length), detail: 'enrollment periods', icon: Calendar, tone: 'amber' },
      ]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { refreshSignals(); }, []);

  const renderPage = () => {
    switch (activeSection) {
      case 'overview': return <Overview />;
      case 'admissions': return <AdmissionsPanel currentUser={currentUser} />;
      case 'enrollments': return <EnrollmentsPanel currentUser={currentUser} />;
      case 'payments': return <PaymentsPanel />;
      case 'certificates': return <CertificateManager currentUserRole={currentUser.role} />;
      case 'templates': return <CertificateTemplateManager />;
      case 'periods': return <EnrollmentPeriodsPanel currentUser={currentUser} />;
      case 'students': return <StudentDetailPanel />;
      case 'milestones': return <LearningMilestonesManager currentUser={currentUser} />;
      case 'materials': return <LearningMaterialsPanel currentUser={currentUser} />;
      case 'event-registrations': return <RegistrationManager />;
      case 'reports': return <ReportsPanel currentUser={currentUser} />;
      case 'account': return <AdminAccount currentUser={currentUser} />;
    }
  };

  const activeLabel = NAV_ITEMS.find(n => n.id === activeSection)?.label ?? '';

  return (
    <AppLayout
      sidebar={{
        items: NAV_ITEMS,
        activeSection,
        onSectionChange: (id) => setActiveSection(id as SectionId),
        title: 'Secretary Dashboard',
        icon: Shield,
        userName: currentUser.name,
        userRole: 'Secretary',
      }}
      topNavbar={{
        title: activeLabel,
        subtitle: 'Secretary Dashboard',
        actions: (
          <button onClick={refreshSignals} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        ),
      }}
      onLogout={onLogout}
    >
      <DashboardCommandCenter
        title="Secretary Command Center"
        subtitle="Student admissions, enrollments, payments, certificates, templates, periods, milestones, and materials."
        signals={signals.slice(0, 4)}
      />
      {renderPage()}
    </AppLayout>
  );
}
