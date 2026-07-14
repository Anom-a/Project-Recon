
import type { AppNotification } from '@/shared/types';
export async function getNotifications(): Promise<AppNotification[]> { return []; }
export async function markAsRead(id: string): Promise<void> {}
export async function markAllAsRead(): Promise<void> {}
export async function getUnreadCount(): Promise<number> { return 0; }
export async function dismissNotification(id: string): Promise<void> {}

