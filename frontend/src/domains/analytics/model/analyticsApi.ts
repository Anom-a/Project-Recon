import type { AnalyticsData } from '../../../shared/types';

const MOCK_ANALYTICS: AnalyticsData = {
  monthlyRevenue: [
    { month: 'Jan', amount: 45000 }, { month: 'Feb', amount: 52000 }, { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 }, { month: 'May', amount: 58000 }, { month: 'Jun', amount: 72000 },
  ],
  enrollmentTrend: [
    { month: 'Jan', count: 45 }, { month: 'Feb', count: 52 }, { month: 'Mar', count: 48 },
    { month: 'Apr', count: 63 }, { month: 'May', count: 58 }, { month: 'Jun', count: 74 },
  ],
  programDistribution: [
    { program: 'VEX IQ', count: 35, color: '#25338d' },
    { program: 'VEX V5', count: 28, color: '#ed1c24' },
    { program: 'Enjoy AI', count: 18, color: '#57dffe' },
    { program: 'Arduino', count: 12, color: '#10b981' },
    { program: 'STEM', count: 7, color: '#f59e0b' },
  ],
  topMetrics: [
    { label: 'Total Students', value: '548', change: '+12%', trend: 'up' },
    { label: 'Active Programs', value: '12', change: '+2', trend: 'up' },
    { label: 'Revenue (ETB)', value: '336,000', change: '+18%', trend: 'up' },
    { label: 'Completion Rate', value: '87%', change: '+5%', trend: 'up' },
  ],
  recentTransactions: [
    { id: 't1', student: 'Abebe K.', amount: 5400, type: 'Program Fee', date: 'Jun 15', status: 'completed' },
    { id: 't2', student: 'Selam B.', amount: 3500, type: 'Workshop', date: 'Jun 14', status: 'completed' },
  ],
};

export async function getAnalytics(): Promise<AnalyticsData> {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_ANALYTICS;
}
