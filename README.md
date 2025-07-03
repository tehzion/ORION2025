# Orion Project Management System

A modern, responsive project management application built with React, TypeScript, and Vite. Features an innovative "task elevator" system for managing project workflows.

## 🚀 Demo Mode

This application includes a **Demo Mode** that allows you to explore all features without requiring a Supabase backend setup. The demo includes:

- **Mock Projects**: Sample projects with realistic data
- **Task Elevator**: Interactive task management with different statuses
- **User Authentication**: Simulated login experience
- **Search & Filtering**: Advanced search with multiple criteria
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🎯 Features

### Core Features
- **Project Dashboard**: Overview of all projects with completion tracking
- **Task Elevator**: Visual task management with status progression
- **Advanced Search**: Multi-criteria filtering and search functionality
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Role-Based Access**: Different permissions for owners, developers, and clients

### Task Management
- **Status Tracking**: Pending → In Progress → Ready for Review → Approved
- **Review System**: Request revisions with comments
- **Due Date Management**: Overdue tracking and notifications
- **Assignee Management**: Task assignment and tracking

### User Experience
- **Keyboard Shortcuts**: Quick navigation and search (Cmd/Ctrl + K)
- **Real-time Updates**: Live status changes and notifications
- **Modern UI**: Dark theme with gradient accents
- **Mobile Navigation**: Touch-optimized mobile interface

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Static hosting ready

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start (Demo Mode)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orion-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

The application will automatically run in **Demo Mode** with mock data, allowing you to explore all features immediately.

### Production Build

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   The `dist/` folder contains the production-ready files that can be deployed to any static hosting service.

## 🌐 Deployment Options

### Static Hosting (Recommended for Demo)
- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your repository for automatic deployments
- **GitHub Pages**: Deploy directly from the repository
- **Firebase Hosting**: Google's static hosting solution

### Example: Netlify Deployment
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Your demo will be live instantly!

## 🔧 Configuration

### Demo Mode Configuration
The demo mode can be configured in `src/lib/demo.ts`:

```typescript
export const DEMO_CONFIG = {
  autoLogin: true,           // Auto-login with demo user
  showDemoBanner: true,      // Show demo banner
  allowCreateProjects: true, // Allow creating new projects
  allowCreateTasks: true     // Allow creating new tasks
}
```

### Supabase Integration (Optional)
To use with real data:

1. Create a Supabase project
2. Set up environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run database migrations from `supabase/migrations/`
4. Set `DEMO_MODE = false` in `src/lib/demo.ts`

## 📱 Mobile Experience

The application is fully responsive and optimized for mobile devices:

- **Touch-friendly interface**: Large buttons and touch targets
- **Mobile navigation**: Collapsible sidebar with hamburger menu
- **Gesture support**: Swipe gestures for task management
- **Offline capability**: Works without internet connection in demo mode

## 🎨 Customization

### Theme Customization
The application uses Tailwind CSS with a dark theme. Customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      slate: { /* custom slate colors */ },
      purple: { /* custom purple colors */ },
      blue: { /* custom blue colors */ }
    }
  }
}
```

### Component Styling
All components use Tailwind classes and can be easily customized by modifying the className props.

## 🚀 Performance

- **Fast Loading**: Optimized bundle size (~430KB gzipped)
- **Lazy Loading**: Components load on demand
- **Caching**: Static assets are cached for optimal performance
- **SEO Ready**: Meta tags and structured data included

## 📊 Demo Data

The demo includes realistic sample data:

### Projects
- E-commerce Platform (75% complete)
- Mobile App Redesign (45% complete)
- API Integration (90% complete)

### Tasks
- Design System Setup (Approved)
- User Authentication (Ready for Review)
- Product Catalog (Revisions Requested)
- Shopping Cart (In Progress)
- Payment Integration (Pending)
- Order Management (Pending)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the demo mode for feature exploration
- Review the code comments for implementation details

---

**Ready to explore?** Start the development server and dive into the demo mode to experience the full Orion Project Management System! 