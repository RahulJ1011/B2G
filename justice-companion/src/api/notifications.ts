import api from "./axios";
import type { Notification } from "@/lib/types";

export async function getNotifications(): Promise<{ notifications: Notification[] }> {
    const { data } = await api.get("/notifications");
    return data;
}

export async function getUnreadNotifications(): Promise<{
    success: boolean;
    notifications: Notification[];
}> {
    const { data } = await api.get("/notifications/my");
    return data;
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
}
