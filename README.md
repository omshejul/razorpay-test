# 🔐 OAuth Next.js Application

A modern Next.js 15 application featuring Google OAuth authentication, built with shadcn/ui components, Tailwind CSS, and next-themes for seamless light/dark mode switching.

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.11-000000?style=flat-square)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google accounts
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui components
- 🌓 **Theme Switching** - Light, dark, and system theme support
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Next.js 15** - Latest App Router with Turbopack
- 🔒 **Type Safety** - Full TypeScript support
- 🎯 **Accessibility** - WCAG compliant components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Google OAuth credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/omshejul/next-boilerplate.git
   cd next-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your Google OAuth credentials to `.env.local`:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth Credentials

1. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Set application type to "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Copy the Client ID and Client Secret to your `.env.local`

## 🏗️ Project Structure

```
next-boilerplate/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # NextAuth.js API routes
│   ├── auth/signin/       # Custom sign-in page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   │   ├── sign-in-button.tsx
│   │   ├── sign-out-button.tsx
│   │   └── user-profile.tsx
│   ├── providers/         # Context providers
│   │   ├── session-provider.tsx
│   │   └── theme-provider.tsx
│   ├── ui/                # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   └── theme-toggle.tsx   # Theme switcher
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript definitions
│   └── next-auth.d.ts    # NextAuth type extensions
└── public/               # Static assets
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components:

- **Button** - Interactive elements with variants
- **Card** - Content containers with headers
- **Avatar** - User profile images with fallbacks
- **Dropdown Menu** - Context menus and navigation
- **Separator** - Visual content separation

## 🌓 Theme System

Built with [next-themes](https://github.com/pacocoursey/next-themes):

- **Light Theme** - Clean, bright interface
- **Dark Theme** - Easy on the eyes
- **System Theme** - Follows OS preference
- **Smooth Transitions** - Elegant theme switching

## 🔐 Authentication Flow

1. **Unauthenticated State** - Shows sign-in button
2. **Loading State** - Displays loading spinner
3. **Authenticated State** - Shows user profile and sign-out option
4. **Session Management** - Automatic session handling

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Responsive breakpoints
- **Desktop Experience** - Full-featured desktop interface
- **Touch Friendly** - Proper touch targets and gestures

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🧩 Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
```

## 🔧 Configuration Files

- **`next.config.ts`** - Next.js configuration with image domains
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`components.json`** - shadcn/ui configuration
- **`.cursorrules`** - Cursor AI project rules

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

Made with ❤️ using Next.js and shadcn/ui
