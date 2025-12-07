# Portfolio Website

A modern, full-stack portfolio website built with SvelteKit, featuring a blog system, contact management, and admin panel.

## Features

### Public Features
- Responsive design optimized for mobile and desktop
- Project showcase with live demo and repository links
- Skills and expertise sections
- Contact form with auto-reply functionality
- Blog with markdown support
- Hidden admin access (click copyright symbol 5 times)

### Admin Panel
- Secure authentication with password protection
- Blog post management (create, edit, delete, publish/draft)
- Contact management system with email threading
- Markdown support for email replies with live preview
- SMTP integration for sending emails
- IMAP integration for receiving replies
- Contact numbering system for tracking conversations
- Status tracking (new, replied, closed)

### Technical Features
- MongoDB for data storage
- Email system with markdown-to-HTML conversion
- Automatic reply on form submission
- Email thread matching by contact number
- Duplicate prevention and cleanup tools
- Mobile-responsive throughout

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Email**: Nodemailer (SMTP), IMAP
- **Markdown**: Marked, html-to-text
- **Language**: TypeScript

## Setup

### Prerequisites
- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- Email account with SMTP/IMAP access (Gmail recommended)

### Installation

1. Clone the repository:
```sh
git clone https://github.com/gamerwaves/website.git
cd website
```

2. Install dependencies:
```sh
pnpm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
ADMIN_PASSWORD=your-secure-password
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
```

For Gmail, generate an App Password at https://myaccount.google.com/apppasswords

## Development

### Running Locally
```sh
pnpm run dev
```

### Building for Production
```sh
pnpm run build
```

### Preview Production Build
```sh
pnpm run preview
```

## Admin Access

Access the admin panel at `/admin` or click the copyright symbol in the footer 5 times.

### Admin Features
- **Blog Management**: Create and edit blog posts with markdown
- **Contact Management**: View messages, reply with markdown formatting, track conversation threads
- **Email Sync**: Manually sync replies from IMAP
- **Cleanup Tools**: Remove duplicates and convert HTML emails to text

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── db.ts          # MongoDB connection
│   │   └── email.ts       # Email utilities
│   └── stores/
│       └── blog.ts        # Blog types
├── routes/
│   ├── admin/
│   │   ├── contacts/      # Contact management
│   │   └── +page.svelte   # Admin dashboard
│   ├── api/
│   │   ├── contact/       # Contact form API
│   │   ├── sync-replies/  # Email sync API
│   │   └── cleanup-contacts/ # Cleanup API
│   ├── blog/
│   │   ├── [slug]/        # Individual blog posts
│   │   └── +page.svelte   # Blog listing
│   └── +page.svelte       # Homepage
└── app.css                # Global styles
```

## Author

Dwait Pandhi
- Website: https://gamerwaves.hackclub.app
- GitHub: https://github.com/gamerwaves
- Email: dwait.pandhi@gmail.com
