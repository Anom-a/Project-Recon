import { MOCK_NOTIFICATIONS } from '../../../shared/constants/mock-data';
import type { AppNotification } from '../../../shared/types';

export async function getNotifications(): Promise<AppNotification[]> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_NOTIFICATIONS;
}

export async function markAsRead(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 100));
}

export async function markAllAsRead(): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
}
