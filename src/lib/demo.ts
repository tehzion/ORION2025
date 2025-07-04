// Demo configuration for offline/standalone deployment
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL

// Demo users for authentication
export const DEMO_USERS = [
  {
    id: 'demo-admin',
    name: 'Super Admin',
    email: 'admin@orion.com',
    password: 'admin123',
    full_name: 'Super Admin',
    role: 'super_admin' as const,
    description: 'Full system access',
    color: 'text-yellow-400',
    icon: 'Shield'
  },
  {
    id: 'demo-developer',
    name: 'Developer',
    email: 'dev@orion.com',
    password: 'dev123',
    full_name: 'Developer',
    role: 'user' as const,
    description: 'Task and project access',
    color: 'text-green-400',
    icon: 'Users'
  },
  {
    id: 'demo-client',
    name: 'Client',
    email: 'client@orion.com',
    password: 'client123',
    full_name: 'Client',
    role: 'user' as const,
    description: 'Project viewing and feedback',
    color: 'text-purple-400',
    icon: 'Eye'
  }
]

// Mock user data for demo
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@orion.com',
  full_name: 'Demo User'
}

// Mock profile data
export const DEMO_PROFILE = {
  id: 'demo-user-123',
  full_name: 'Demo User',
  global_role: 'super_admin' as const,
  timezone: 'UTC',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock projects for demo
export const DEMO_PROJECTS = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    status: 'active' as const,
    priority: 'high' as const,
    progress: 75,
    due_date: '2024-02-28',
    budget: 25000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 'demo-user-123',
    client_id: 'client-1',
    tags: ['web-design', 'ecommerce', 'react']
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'Complete UI/UX overhaul of the mobile application',
    status: 'active' as const,
    priority: 'medium' as const,
    progress: 45,
    due_date: '2024-03-15',
    budget: 35000,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    created_by: 'demo-user-123',
    client_id: 'client-2',
    tags: ['mobile', 'ui-ux', 'design']
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Integrate third-party APIs for enhanced functionality',
    status: 'completed' as const,
    priority: 'high' as const,
    progress: 100,
    due_date: '2024-01-30',
    budget: 15000,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-16T09:15:00Z',
    created_by: 'demo-user-123',
    client_id: 'client-3',
    tags: ['api', 'integration', 'backend']
  }
]

// Mock tasks for demo
export const DEMO_TASKS = [
  {
    id: '1',
    project_id: '1',
    title: 'Design System Setup',
    description: 'Create a comprehensive design system with components, colors, and typography',
    status: 'approved' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-01-20T23:59:59Z',
    floor_position: 1,
    deliverable_link: 'https://figma.com/design-system-mockup',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    project_id: '1',
    title: 'User Authentication',
    description: 'Implement secure user authentication with email/password and social login',
    status: 'ready-for-review' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-01-25T23:59:59Z',
    floor_position: 2,
    deliverable_link: 'https://github.com/project/pull/123',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    project_id: '1',
    title: 'Product Catalog',
    description: 'Build dynamic product catalog with search, filters, and pagination',
    status: 'revisions-requested' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-02-01T23:59:59Z',
    floor_position: 3,
    deliverable_link: 'https://staging.example.com/catalog',
    review_comments: 'The search functionality needs improvement. Please add autocomplete and fix the filter reset button.',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-16T16:45:00Z'
  },
  {
    id: '4',
    project_id: '1',
    title: 'Shopping Cart',
    description: 'Implement shopping cart functionality with add/remove items and quantity updates',
    status: 'in-progress' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-02-05T23:59:59Z',
    floor_position: 4,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    project_id: '1',
    title: 'Payment Integration',
    description: 'Integrate Stripe payment processing for secure transactions',
    status: 'pending' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-02-10T23:59:59Z',
    floor_position: 5,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    project_id: '1',
    title: 'Order Management',
    description: 'Build order management system for tracking and fulfillment',
    status: 'pending' as const,
    assignee_id: 'demo-user-123',
    due_date: '2024-02-15T23:59:59Z',
    floor_position: 6,
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z'
  }
]

// Demo configuration
export const DEMO_CONFIG = {
  autoLogin: true,
  showDemoBanner: true,
  allowCreateProjects: true,
  allowCreateTasks: true
} 