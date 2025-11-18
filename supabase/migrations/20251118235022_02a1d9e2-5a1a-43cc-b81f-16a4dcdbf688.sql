-- Downgrade +254711625144 from super_admin to admin
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = '53c694cc-4792-4628-9ea7-839059fcbbad' AND role = 'super_admin';