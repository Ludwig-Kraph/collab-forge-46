-- Enable realtime for key tables (only set REPLICA IDENTITY)
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.payment_requests REPLICA IDENTITY FULL;
ALTER TABLE public.mpesa_accounts REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.invitations REPLICA IDENTITY FULL;
ALTER TABLE public.system_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.subscription_tiers REPLICA IDENTITY FULL;
ALTER TABLE public.mpesa_daraja_configs REPLICA IDENTITY FULL;
ALTER TABLE public.user_mpesa_accounts REPLICA IDENTITY FULL;