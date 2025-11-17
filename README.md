# M-Leja - MPESA Payment Management System

M-Leja is a Progressive Web Application (PWA) designed to streamline MPESA payment operations for businesses and government agencies.

## Features

- **STK Push Payments**: Trigger payment requests to Till and Paybill numbers
- **Transaction Management**: Automatic capture and organization of MPESA transactions
- **Digital Ledger**: Comprehensive financial tracking and analytics
- **Multi-User Support**: Role-based access control for teams
- **Government Integration**: Specialized framework for national and county operations
- **Control Panel**: Administrative system for platform-wide management
- **Cookie Consent**: GDPR and Kenya Data Protection Act compliance
- **Device Management**: Revoke access from specific devices
- **Custom MPESA Credentials**: Per-account MPESA Daraja API configuration

## Self-Hosting Installation Guide

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun
- Supabase account (for backend services)
- MPESA Daraja API credentials (Live environment recommended)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd m-leja
npm install  # or yarn install / bun install
```

### Step 2: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run all database migrations from `supabase/migrations/` in order
3. Set up authentication providers (Email/Phone)
4. Configure Row Level Security (RLS) policies as defined in migrations

### Step 3: Environment Configuration

Update `src/integrations/supabase/client.ts` with your Supabase credentials

### Step 4: MPESA Daraja API Setup

**IMPORTANT**: Only use MPESA Daraja Live credentials. Sandbox is not supported.

Configure in Supabase Edge Functions secrets

### Step 5: Edge Functions Deployment

Deploy Supabase Edge Functions using Supabase CLI

### Step 6: Build and Deploy

```bash
npm run dev  # Development
npm run build  # Production
```

## Security

See [SECURITY.md](SECURITY.md) for security policies and vulnerability reporting.

## License

Proprietary - All rights reserved
