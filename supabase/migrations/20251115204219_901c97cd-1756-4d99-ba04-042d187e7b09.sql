-- Remove super_admin role from wrong account and keep it on the correct account
DELETE FROM user_roles 
WHERE user_id = '53c694cc-4792-4628-9ea7-839059fcbbad' 
AND role = 'super_admin';