<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
<!-- README.md -->
# Google Drive Manager App
A modern Next.js application that provides a clean interface for managing Google Drive files, featuring OAuth2
authentication and core file operations.
![App Screenshot](docs/images/app-overview.png)
## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Google Cloud Setup](#google-cloud-setup)
    - [Local Development](#local-development)
- [Testing](#testing)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
## Features
✨ Core functionality:
- 🔐 Secure Google OAuth2 authentication
- 📂 Browse and navigate Drive folders
- ⬆️ File upload with progress tracking
- ⬇️ File download
- 🗑️ File deletion
- 🔄 Real-time updates
  ![Features Demo](docs/images/features-demo.gif)
## Tech Stack
- **Framework:** Next.js 14
- **Authentication:** NextAuth.js
- **API Integration:** Google Drive API
- **Styling:** Tailwind CSS + Shadcn UI
- **Language:** TypeScript
- **Testing:** Jest + React Testing Library + Cypress
## Project Structure
```plaintext
├── app/
│   ├── api/            # API routes
│   ├── components/     # React components
│   └── providers/      # Context providers
├── lib/               # Utility functions
├── types/             # TypeScript definitions
├── tests/             # Test files
└── public/            # Static assets
```
## Getting Started
### Prerequisites
- Node.js 18+ and npm
- Git
- A Google account
### Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   ![Enable API](docs/images/enable-api.png)
4. Configure OAuth Consent Screen:
    - Set User Type to "External"
    - Add required app information
    - Add scopes for Drive API
    - Add test users if in testing mode
5. Create OAuth 2.0 Credentials:
    - Create OAuth Client ID
    - Application type: Web application
    - Add authorized JavaScript origins:
      ```
      http://localhost:3000
      ```
    - Add authorized redirect URIs:
      ```
      http://localhost:3000/api/auth/callback/google
      ```
    - Download client credentials
      ![OAuth Setup](docs/images/oauth-setup.png)
### Local Development
1. Clone the repository:
```bash
git clone https://github.com/FelipeLVieira/google-drive-manager.git
cd google-drive-manager
```
2. Install dependencies:
```bash
npm install
```
3. Create environment file:
   Create a `.env.local` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```
4. Run development server:
```bash
npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000)
## Testing
### Unit Tests
```bash
# Run unit tests
npm run test
# Run with coverage
npm run test:coverage
```
### Integration Tests
```bash
# Run Cypress tests in headless mode
npm run cypress:run
# Open Cypress Test Runner
npm run cypress:open
```
### Test Coverage Requirements
- Minimum 80% coverage required
- Critical paths must have 100% coverage
## Security
- **Authentication:** OAuth 2.0 with NextAuth.js
- **Authorization:** Drive API scope limitations
- **File Validation:** Size and type checking
- **Rate Limiting:** Implemented on API routes
- **CSRF Protection:** Built-in Next.js protection
- **Security Headers:** Custom middleware implementation
## API Documentation
### List Files
```typescript
GET / api / drive
Query
Parameters:
    -folderId ? : string
    - sortBy ? : 'name' | 'modifiedTime' | 'size'
    - sortOrder ? : 'asc' | 'desc'
```
### Upload File
```typescript
POST / api / drive
Body: FormData
- file
:
File
- folderId ? : string
```
### Download File
```typescript
GET / api / drive / [fileId]
```
### Delete File
```typescript
DELETE / api / drive / [fileId]
```
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
---