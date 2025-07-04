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
    id: 'demo-admin-2',
    name: 'Admin',
    email: 'admin2@orion.com',
    password: 'admin123',
    full_name: 'Admin User',
    role: 'admin' as const,
    description: 'Team and project management',
    color: 'text-blue-400',
    icon: 'Shield'
  },
  {
    id: 'demo-developer',
    name: 'Developer',
    email: 'dev@orion.com',
    password: 'dev123',
    full_name: 'Developer',
    role: 'developer' as const,
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
    role: 'client' as const,
    description: 'Project viewing and feedback',
    color: 'text-purple-400',
    icon: 'Eye'
  },
  {
    id: 'demo-viewer',
    name: 'Viewer',
    email: 'viewer@orion.com',
    password: 'viewer123',
    full_name: 'Viewer',
    role: 'viewer' as const,
    description: 'Read-only access',
    color: 'text-slate-400',
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

// Mock departments for demo
export const DEMO_DEPARTMENTS = [
  {
    id: 'dept-1',
    name: 'Technical Support',
    description: 'Technical issues and bug reports',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-2',
    name: 'General',
    description: 'General inquiries and questions',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-3',
    name: 'Billing',
    description: 'Billing and payment issues',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-4',
    name: 'Feature Requests',
    description: 'New feature requests and suggestions',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Mock support tickets for demo
export const DEMO_SUPPORT_TICKETS = [
  {
    id: 'ticket-1',
    user_id: 'demo-user-123',
    subject: 'Login issues with new authentication system',
    description: 'I\'m having trouble logging in after the recent authentication system update. The page keeps showing an error message about invalid credentials, but I\'m sure I\'m using the correct password.',
    priority: 'high' as const,
    status: 'in_progress' as const,
    assigned_to_department_id: 'dept-1',
    assigned_to_user_id: null,
    created_at: '2024-01-10T09:30:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    department: {
      id: 'dept-1',
      name: 'Technical Support',
      description: 'Technical issues and bug reports',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    assigned_user: null
  },
  {
    id: 'ticket-2',
    user_id: 'demo-user-123',
    subject: 'Project dashboard not loading properly',
    description: 'The project dashboard is taking a very long time to load and sometimes shows incomplete data. This is affecting my ability to track project progress effectively.',
    priority: 'medium' as const,
    status: 'open' as const,
    assigned_to_department_id: 'dept-1',
    assigned_to_user_id: null,
    created_at: '2024-01-15T11:45:00Z',
    updated_at: '2024-01-15T11:45:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    department: {
      id: 'dept-1',
      name: 'Technical Support',
      description: 'Technical issues and bug reports',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    assigned_user: null
  },
  {
    id: 'ticket-3',
    user_id: 'demo-user-123',
    subject: 'Request for additional user permissions',
    description: 'I need access to additional project management features for my team. Currently, I can only view projects but cannot create new tasks or update project status.',
    priority: 'low' as const,
    status: 'resolved' as const,
    assigned_to_department_id: 'dept-2',
    assigned_to_user_id: 'demo-admin',
    created_at: '2024-01-08T16:20:00Z',
    updated_at: '2024-01-11T10:15:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    department: {
      id: 'dept-2',
      name: 'General',
      description: 'General inquiries and questions',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    assigned_user: {
      id: 'demo-admin',
      full_name: 'Super Admin',
      global_role: 'super_admin' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'ticket-4',
    user_id: 'demo-user-123',
    subject: 'Billing discrepancy in monthly invoice',
    description: 'I noticed a discrepancy in my latest monthly invoice. The amount charged doesn\'t match the services I\'m currently using. Please review and correct this issue.',
    priority: 'urgent' as const,
    status: 'open' as const,
    assigned_to_department_id: 'dept-3',
    assigned_to_user_id: null,
    created_at: '2024-01-16T08:15:00Z',
    updated_at: '2024-01-16T08:15:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    department: {
      id: 'dept-3',
      name: 'Billing',
      description: 'Billing and payment issues',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    assigned_user: null
  },
  {
    id: 'ticket-5',
    user_id: 'demo-user-123',
    subject: 'Feature request: Dark mode for mobile app',
    description: 'I would love to see a dark mode option for the mobile application. This would be very helpful for users who work in low-light environments or prefer dark themes.',
    priority: 'low' as const,
    status: 'closed' as const,
    assigned_to_department_id: 'dept-4',
    assigned_to_user_id: 'demo-admin-2',
    created_at: '2024-01-05T13:30:00Z',
    updated_at: '2024-01-14T09:45:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    department: {
      id: 'dept-4',
      name: 'Feature Requests',
      description: 'New feature requests and suggestions',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    assigned_user: {
      id: 'demo-admin-2',
      full_name: 'Admin User',
      global_role: 'super_admin' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
]

// Mock ticket messages for demo
export const DEMO_TICKET_MESSAGES = [
  {
    id: 'msg-1',
    ticket_id: 'ticket-1',
    user_id: 'demo-user-123',
    content: 'I\'m still experiencing login issues. Can you please help me resolve this?',
    created_at: '2024-01-10T09:30:00Z',
    updated_at: '2024-01-10T09:30:00Z',
    user: {
      id: 'demo-user-123',
      full_name: 'Demo User',
      global_role: 'user' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'msg-2',
    ticket_id: 'ticket-1',
    user_id: 'demo-admin',
    content: 'Thank you for reporting this issue. I\'ve escalated it to our technical team. They are investigating the authentication system and will provide an update soon.',
    created_at: '2024-01-11T10:15:00Z',
    updated_at: '2024-01-11T10:15:00Z',
    user: {
      id: 'demo-admin',
      full_name: 'Super Admin',
      global_role: 'super_admin' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'msg-3',
    ticket_id: 'ticket-3',
    user_id: 'demo-admin',
    content: 'I\'ve reviewed your request and updated your permissions. You should now have access to create tasks and update project status. Please try logging out and back in to see the changes.',
    created_at: '2024-01-11T10:15:00Z',
    updated_at: '2024-01-11T10:15:00Z',
    user: {
      id: 'demo-admin',
      full_name: 'Super Admin',
      global_role: 'super_admin' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'msg-4',
    ticket_id: 'ticket-5',
    user_id: 'demo-admin-2',
    content: 'Thank you for the feature request! Dark mode for mobile is currently in development and should be available in the next release. I\'ll update this ticket once it\'s deployed.',
    created_at: '2024-01-14T09:45:00Z',
    updated_at: '2024-01-14T09:45:00Z',
    user: {
      id: 'demo-admin-2',
      full_name: 'Admin User',
      global_role: 'super_admin' as const,
      timezone: 'UTC',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
] 