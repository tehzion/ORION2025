import { supabase } from './supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  due_date: string;
  budget: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  client_id?: string;
  tags?: string[];
  members?: ProjectMember[];
  tasks?: ProjectTask[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  joined_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'ready-for-review' | 'approved' | 'revisions-requested' | 'complete';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  completion_percentage?: number;
  floor_position?: number;
  deliverable_link?: string;
  review_comments?: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  budget?: number;
  client_id?: string;
  tags?: string[];
  members?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  due_date?: string;
  budget?: number;
  tags?: string[];
}

class ProjectService {
  // Get all projects for the current user
  async getProjects(): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(user_id),
          tasks(*)
        `)
        .eq('project_members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get a single project by ID
  async getProject(id: string): Promise<Project | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members(
            *,
            user:profiles(id, email, full_name)
          ),
          tasks(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
          progress: 0
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add the creator as owner
      await this.addProjectMember(project.id, user.id, 'owner');

      // Add other members if specified
      if (projectData.members) {
        for (const memberId of projectData.members) {
          if (memberId !== user.id) {
            await this.addProjectMember(project.id, memberId, 'member');
          }
        }
      }

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update a project
  async updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Add a member to a project
  async addProjectMember(projectId: string, userId: string, role: 'owner' | 'manager' | 'member' | 'viewer'): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  }

  // Remove a member from a project
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }

  // Get project tasks
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('floor_position', { ascending: true });

      if (error) throw error;
      return tasks || [];
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(id: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Add a comment
  async addComment(commentData: Omit<ProjectComment, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: comment, error } = await supabase
        .from('project_comments')
        .insert({
          ...commentData,
          user_id: user.id
        })
        .select(`
          *,
          user:users(id, email, full_name)
        `)
        .single();

      if (error) throw error;
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get project comments
  async getProjectComments(projectId: string, taskId?: string): Promise<ProjectComment[]> {
    try {
      let query = supabase
        .from('project_comments')
        .select(`
          *,
          user:users(id, email, full_name)
        `)
        .eq('project_id', projectId);

      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data: comments, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Update project progress based on completed tasks
  async updateProjectProgress(projectId: string): Promise<void> {
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

              const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task: any) => task.status === 'complete').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await this.updateProject(projectId, { progress });
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService(); 