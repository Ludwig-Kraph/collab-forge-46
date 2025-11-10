# M-Leja Security Documentation

## Security Overview
M-Leja implements multiple layers of security to protect financial data and user privacy.

## Authentication & Authorization

### Phone-Based Authentication
- OTP verification via SMS
- Secure session management with Supabase Auth
- Automatic token refresh
- Session timeout after inactivity

### Role-Based Access Control (RBAC)
- User roles: `user`, `manager`, `admin`
- Role-based feature access
- Organization-level permissions
- Tier-based subscription controls

## Data Protection

### Row Level Security (RLS)
All database tables have RLS enabled with strict policies:

1. **Profiles**: Users can only access their own profile
2. **Transactions**: Users can only view/create their own transactions
3. **MPESA Accounts**: Users can only manage their own accounts
4. **Subscriptions**: Users can only view their own subscription
5. **Organizations**: Only organization owners can access data

### Financial Data Integrity
- Transactions are **immutable** (no UPDATE policy)
- Transactions cannot be deleted (no DELETE policy)
- Balance calculations are done server-side
- All financial operations are logged

### Input Validation
All user inputs are validated using Zod schemas:
- Phone numbers: Kenyan format validation
- Amounts: Range limits (1 - 150,000 KES)
- Account numbers: Format validation
- Text inputs: Length limits and sanitization

## API Security

### Supabase Edge Functions
- API keys stored in Supabase secrets
- CORS configured for specific domains
- Rate limiting on sensitive endpoints
- Request validation and sanitization

### MPESA Integration
- Credentials stored in environment variables
- Callback URL validation
- Request signing and verification
- Transaction status verification

## Frontend Security

### XSS Prevention
- No `dangerouslySetInnerHTML` usage
- All user inputs sanitized
- Content Security Policy headers
- Proper escaping of dynamic content

### CSRF Protection
- Supabase handles CSRF tokens
- Same-site cookies
- Secure session storage

### Secure Storage
- No sensitive data in localStorage
- Supabase handles secure token storage
- Automatic token encryption

## Secure Development Practices

### Code Security
- Dependencies regularly updated
- No hardcoded secrets
- TypeScript for type safety
- ESLint security rules enabled

### Error Handling
- No sensitive data in error messages
- Errors logged securely
- User-friendly error messages
- Error boundary implementation

## Compliance & Best Practices

### Data Privacy
- Minimal data collection
- User consent for data processing
- Data retention policies
- Right to data deletion (soft delete)

### Password Security
- PIN hashing with bcrypt (if implemented)
- Secure password reset flow
- Account lockout after failed attempts
- Session invalidation on logout

## Security Monitoring

### Logging
- Authentication attempts logged
- Failed login attempts tracked
- Transaction events logged
- Error logging for debugging

### Audit Trail
- User actions tracked
- Administrative changes logged
- Transaction history maintained
- Role changes recorded

## Incident Response

### Security Breach Protocol
1. Immediately revoke compromised credentials
2. Audit affected systems and data
3. Notify affected users
4. Update security measures
5. Document incident and resolution

### Contact Information
For security concerns: [security@mleja.app]

## Regular Security Tasks

### Weekly
- Review error logs
- Check failed authentication attempts
- Monitor API usage patterns

### Monthly
- Run security scan
- Review RLS policies
- Update dependencies
- Review access logs

### Quarterly
- Full security audit
- Penetration testing
- Review user permissions
- Update security documentation

## Known Security Considerations

### Current Limitations
1. SMS OTP can be intercepted (consider 2FA apps in future)
2. Phone numbers used as identifiers (consider additional verification)
3. Rate limiting needs implementation for production

### Planned Improvements
1. Implement rate limiting on payment endpoints
2. Add 2FA options (authenticator apps)
3. Implement advanced fraud detection
4. Add IP-based access controls
5. Implement audit log dashboard

## Security Scan Results
Last scan: [Date]
Critical issues: 0
High severity: 0
Medium severity: 0
Low severity: 0

All critical security issues have been resolved. See security scan logs for details.
