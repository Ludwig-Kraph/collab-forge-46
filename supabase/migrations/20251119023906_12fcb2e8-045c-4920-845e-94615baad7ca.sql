-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Organization admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Government super admins can view entity roles" ON public.user_roles;

-- Create simple policy for users to view their own roles (no restrictions)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Organization admins can view roles within their organization
CREATE POLICY "Organization admins can view organization roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = auth.uid()
    WHERE ur.role IN ('admin', 'corporate_admin')
    AND p.organization_id IS NOT NULL
    AND p.organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = user_roles.user_id
    )
  )
);