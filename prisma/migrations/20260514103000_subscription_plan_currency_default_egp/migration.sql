-- Default currency for new subscription plan rows: EGP (ج.م)
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "currency" SET DEFAULT 'EGP';
