/**
 * هيكل جاهز لإشعارات الويب (Push) — التفعيل لاحقًا يتطلب:
 * - VAPID keys في البيئة
 * - جدول اشتراكات في قاعدة البيانات
 * - Service Worker يستمع لـ push
 */

export type PushSubscriptionDTO = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function savePushSubscription(userId: string, sub: PushSubscriptionDTO): Promise<void> {
  void userId;
  void sub;
  throw new Error("PUSH_NOT_ENABLED: ربط اشتراك الدفع غير مفعّل بعد.");
}

export async function removePushSubscription(userId: string): Promise<void> {
  void userId;
  throw new Error("PUSH_NOT_ENABLED");
}
