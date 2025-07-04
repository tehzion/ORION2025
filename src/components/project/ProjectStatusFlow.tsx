import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface ProjectStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  details?: string;
  assignee?: string;
}

interface ProjectStatusFlowProps {
  projectId: string;
  projectName: string;
  currentStage: string;
  stages: ProjectStage[];
  onStageClick?: (stageId: string) => void;
}

const ProjectStatusFlow: React.FC<ProjectStatusFlowProps> = ({
  projectId,
  projectName,
  currentStage,
  stages,
  onStageClick
}) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'current':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-6 h-6 text-slate-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'current':
        return 'border-blue-500 bg-blue-500/10';
      case 'pending':
        return 'border-slate-600 bg-slate-800';
      default:
        return 'border-slate-600 bg-slate-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{projectName}</h2>
        <p className="text-slate-400">Project ID: {projectId}</p>
      </div>

      {/* Status Flow */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {/* Connection Line */}
            {index < stages.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-12 bg-slate-600 transform -translate-x-1/2"></div>
            )}

            {/* Stage Card */}
            <div
              className={`relative border-l-4 ${getStatusColor(stage.status)} p-4 ml-6 rounded-r-lg cursor-pointer transition-all duration-200 hover:shadow-md`}
              onClick={() => {
                setExpandedStage(expandedStage === stage.id ? null : stage.id);
                onStageClick?.(stage.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(stage.status)}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      stage.status === 'completed' ? 'text-green-400' :
                      stage.status === 'current' ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                      {stage.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{stage.description}</p>
                    
                    {/* Timestamp and Assignee */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      {stage.timestamp && (
                        <span>📅 {stage.timestamp}</span>
                      )}
                      {stage.assignee && (
                        <span>�� {stage.assignee}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Arrow */}
                <ArrowRight 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    expandedStage === stage.id ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* Expanded Details */}
              {expandedStage === stage.id && stage.details && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <h4 className="font-medium text-white mb-2">Details</h4>
                  <p className="text-slate-300 text-sm">{stage.details}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-8 p-4 bg-slate-700 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Overall Progress</span>
          <span className="text-sm text-slate-400">
            {stages.filter(s => s.status === 'completed').length} of {stages.length} stages completed
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(stages.filter(s => s.status === 'completed').length / stages.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusFlow; 