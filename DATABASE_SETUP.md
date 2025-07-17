# VovZone Database System Setup

This guide explains how to set up and use the database system for admin login and designer login functionality in the VovZone Interior Design Marketplace.

## Architecture Overview

The application now uses a proper database system with:
- **Backend**: Express.js server with SQLite database
- **Frontend**: React with API integration
- **Authentication**: JWT-based authentication
- **Database**: SQLite with proper schema for users, designers, and applications

## Features

### 🔐 Authentication System
- **Admin Login**: Pre-configured admin account for managing the platform
- **Designer Registration**: Application system requiring admin approval
- **JWT Security**: Token-based authentication with automatic token refresh
- **Session Management**: Secure session handling with proper logout

### 👑 Admin Features
- View all pending designer applications
- Approve or reject designer applications
- Real-time database connection status
- User management dashboard

### 🎨 Designer Features
- Registration with application submission
- Secure login after approval
- Profile management
- Dashboard access after approval

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Database Server

```bash
npm run server
```

The server will start on port 3001 and automatically:
- Create the SQLite database (`server/database/vovzone.db`)
- Set up all required tables
- Create the default admin account

### 3. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The frontend will start on port 5173 (or another available port).

## Database Schema

### Tables Created Automatically

1. **users** - Main user authentication table
2. **designers** - Designer profile information
3. **designer_specialties** - Designer specialization tags
4. **projects** - Designer projects (for future use)
5. **project_images** - Project image management
6. **project_tags** - Project categorization
7. **sessions** - JWT session management
8. **analytics** - Usage analytics

## Default Admin Account

**Important**: The system automatically creates an admin account with these credentials:

- **Email**: `admin@vovzone.com`
- **Password**: `vovzone2025`

Use these credentials to:
1. Login to the admin dashboard
2. Manage designer applications
3. Approve/reject new designers

## How to Use

### For Administrators

1. **Login**: Go to `/login` and use admin credentials
2. **Dashboard**: Access admin dashboard to see database status
3. **Manage Applications**: View and approve/reject pending designer applications
4. **Monitor System**: Check database connection status and system health

### For Designers

1. **Register**: Go to `/register` and fill out the application form
2. **Wait for Approval**: Admin will review your application
3. **Login**: Once approved, use your email/password to login
4. **Access Dashboard**: View your designer dashboard and manage profile

### Testing the System

1. **Test Database Connection**: 
   - Login as admin
   - Check the "Database Connection" card shows green status
   - Click "Test Connection" to verify connectivity

2. **Test Designer Registration**:
   - Register a new designer account
   - Login as admin to see the pending application
   - Approve the designer
   - Login with designer credentials

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin or approved designer
- `POST /api/auth/register` - Submit designer application
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Admin (Requires Admin Role)
- `GET /api/admin/applications/pending` - Get pending designer applications
- `POST /api/admin/applications/:userId/approve` - Approve designer
- `POST /api/admin/applications/:userId/reject` - Reject designer

### General
- `GET /api/health` - Check server and database health

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure authentication with 24-hour expiration
- **Role-Based Access**: Admin and designer role separation
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **CORS Configuration**: Proper cross-origin request handling

## Environment Configuration

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:3001/api
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

## Database Location

The SQLite database is created at: `server/database/vovzone.db`

This file contains all user data, applications, and system information.

## Troubleshooting

### Database Connection Issues

1. **Check Server Status**: Make sure `npm run server` is running
2. **Port Conflicts**: Ensure port 3001 is available
3. **Database Permissions**: Check file system permissions for database directory

### Authentication Issues

1. **Clear Browser Storage**: Remove localStorage data if needed
2. **Token Expiration**: Tokens expire after 24 hours, login again
3. **Role Permissions**: Ensure user has proper role (admin/designer)

### Common Error Messages

- `"Database connection failed"` - Server not running or database corrupted
- `"Invalid credentials"` - Wrong email/password or user not approved
- `"Admin access required"` - Trying to access admin features without admin role
- `"Token expired"` - JWT token has expired, need to login again

## Development

### Adding New Features

1. **Database Changes**: Modify `server/database/database.js`
2. **API Endpoints**: Add routes in `server/index.js`
3. **Frontend Integration**: Update `src/services/api.ts`
4. **UI Components**: Create/modify components in `src/components/`

### Database Backup

To backup the database:
```bash
cp server/database/vovzone.db server/database/vovzone_backup.db
```

### Reset Database

To reset the database (removes all data):
```bash
rm server/database/vovzone.db
npm run server
```

## Production Deployment

For production deployment:

1. Use environment variables for sensitive data
2. Use a production database (PostgreSQL, MySQL)
3. Configure proper CORS settings
4. Set up SSL/HTTPS
5. Use PM2 or similar for process management

## Support

The database system is now fully integrated with:
- ✅ Admin login functionality
- ✅ Designer registration and approval system
- ✅ JWT authentication
- ✅ Real-time database status monitoring
- ✅ Secure password handling
- ✅ Role-based access control

For issues or questions, check the browser console and server logs for detailed error messages.