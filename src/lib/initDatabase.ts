import { supabase } from './supabase';

export const initializeDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (projectsError && projectsError.code === '42P01') {
      console.log('Database tables not found. Please run the migrations first.');
      return false;
    }

    console.log('Database is properly initialized');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

export const seedSampleData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return;
    }

    // Check if we already have projects
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (existingProjects && existingProjects.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Create sample projects
    const sampleProjects = [
      {
        name: 'E-commerce Website Redesign',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
        status: 'active',
        priority: 'high',
        due_date: '2024-02-15',
        budget: 25000,
        tags: ['web-design', 'ecommerce', 'ui-ux'],
        created_by: user.id
      },
      {
        name: 'Mobile App Development',
        description: 'iOS and Android app for customer engagement and loyalty program',
        status: 'active',
        priority: 'medium',
        due_date: '2024-03-20',
        budget: 35000,
        tags: ['mobile', 'ios', 'android'],
        created_by: user.id
      },
      {
        name: 'Database Migration',
        description: 'Migrate legacy database to cloud infrastructure with zero downtime',
        status: 'completed',
        priority: 'high',
        due_date: '2024-01-30',
        budget: 15000,
        tags: ['database', 'migration', 'cloud'],
        created_by: user.id
      }
    ];

    for (const projectData of sampleProjects) {
      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error creating sample project:', error);
        continue;
      }

      // Add the creator as owner
      await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner'
        });

      // Create some sample tasks
      const sampleTasks = [
        {
          project_id: project.id,
          title: 'Project Planning',
          description: 'Define project scope, timeline, and deliverables',
          status: 'completed',
          priority: 'high',
          created_by: user.id
        },
        {
          project_id: project.id,
          title: 'Design Phase',
          description: 'Create wireframes and mockups',
          status: 'in-progress',
          priority: 'medium',
          created_by: user.id
        },
        {
          project_id: project.id,
          title: 'Development',
          description: 'Implement core functionality',
          status: 'pending',
          priority: 'high',
          created_by: user.id
        }
      ];

      for (const taskData of sampleTasks) {
        await supabase
          .from('project_tasks')
          .insert(taskData);
      }
    }

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}; 