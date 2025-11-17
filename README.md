# M-Leja - MPESA Payment Management System

M-Leja is a Progressive Web Application (PWA) designed to streamline MPESA payment operations for businesses and government agencies.

## Features

- **STK Push Payments**: Trigger payment requests to Till and Paybill numbers
- **Transaction Management**: Automatic capture and organization of MPESA transactions
- **Digital Ledger**: Comprehensive financial tracking and analytics
- **Multi-User Support**: Role-based access control for teams
- **Government Integration**: Specialized framework for national and county operations
- **Control Panel**: Administrative system for platform-wide management

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd m-leja
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials

4. Run the development server:
```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **APIs**: MPESA Daraja API
- **PWA**: Service Workers, Offline Support

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Application pages
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
└── utils/           # Utility functions
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Security

See [SECURITY.md](SECURITY.md) for security policies and vulnerability reporting.

## License

Proprietary - All rights reserved
