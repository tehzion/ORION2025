import React from 'react';
import ProjectStatusFlow from './ProjectStatusFlow';

const ProjectStatusDemo: React.FC = () => {
  const sampleStages = [
    {
      id: 'requirement',
      title: 'Requirement Submitted',
      description: 'Client sends project brief and requirements',
      status: 'completed' as const,
      timestamp: '2024-01-15 10:30 AM',
      assignee: 'Client',
      details: 'Project brief received with detailed requirements including design preferences, timeline, and budget constraints.'
    },
    {
      id: 'discussion',
      title: 'Discussion Started',
      description: 'Initial conversation and clarification phase',
      status: 'completed' as const,
      timestamp: '2024-01-16 02:15 PM',
      assignee: 'Project Manager',
      details: 'Team meeting conducted to clarify requirements, discuss timeline, and address initial questions.'
    },
    {
      id: 'started',
      title: 'Project In Progress',
      description: 'Work begins, tasks assigned to team',
      status: 'completed' as const,
      timestamp: '2024-01-17 09:00 AM',
      assignee: 'Development Team',
      details: 'Development environment set up, tasks distributed among team members, initial architecture planning completed.'
    },
    {
      id: 'updates',
      title: 'Update Shared',
      description: 'Live updates and milestone progress shown',
      status: 'current' as const,
      timestamp: '2024-01-20 11:45 AM',
      assignee: 'Lead Developer',
      details: 'Core functionality implemented, database schema finalized, API endpoints created. Ready for client review.'
    },
    {
      id: 'revisions',
      title: 'Revisions Ongoing',
      description: 'Client feedback and revision phase',
      status: 'pending' as const,
      assignee: 'Client',
      details: 'Awaiting client feedback on current implementation and design mockups.'
    },
    {
      id: 'pending',
      title: 'Pending Approval',
      description: 'Waiting for client approval or input',
      status: 'pending' as const,
      assignee: 'Client',
      details: 'Final deliverables ready for client review and approval.'
    },
    {
      id: 'done',
      title: 'Done',
      description: 'Final work completed',
      status: 'pending' as const,
      assignee: 'QA Team',
      details: 'All features implemented and tested, ready for final delivery.'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Final delivery sent, project closed',
      status: 'pending' as const,
      assignee: 'Project Manager',
      details: 'Project files, documentation, and deployment instructions delivered to client.'
    }
  ];

  const handleStageClick = (stageId: string) => {
    console.log('Stage clicked:', stageId);
    // Add your logic here for handling stage clicks
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Status Tracking</h1>
          <p className="text-gray-600">Track your project progress through each stage</p>
        </div>
        
        <ProjectStatusFlow
          projectId="PRJ-2024-001"
          projectName="E-commerce Website Redesign"
          currentStage="updates"
          stages={sampleStages}
          onStageClick={handleStageClick}
        />
      </div>
    </div>
  );
};

export default ProjectStatusDemo; 