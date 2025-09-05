import { Check, Clock, FileText, Brain, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TimelineStage {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  description?: string;
}

interface ApplicationTimelineProps {
  stages: TimelineStage[];
  className?: string;
  vertical?: boolean;
}

const stageIcons = {
  submitted: FileText,
  verified: Check,
  scored: Brain,
  officer_action: User,
  completed: Check,
};

const getStageIcon = (stageId: string) => {
  return stageIcons[stageId as keyof typeof stageIcons] || Clock;
};

export const ApplicationTimeline = ({ 
  stages, 
  className,
  vertical = false 
}: ApplicationTimelineProps) => {
  return (
    <div className={cn(
      "flex items-center",
      vertical ? "flex-col space-y-4" : "space-x-4",
      className
    )}>
      {stages.map((stage, index) => {
        const Icon = getStageIcon(stage.id);
        const isLast = index === stages.length - 1;
        
        return (
          <div key={stage.id} className={cn(
            "flex items-center",
            vertical ? "w-full" : "flex-col"
          )}>
            {/* Stage Icon & Content */}
            <div className={cn(
              "flex items-center",
              vertical ? "w-full" : "flex-col"
            )}>
              <motion.div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  vertical ? "h-10 w-10" : "h-8 w-8 mb-2",
                  stage.status === 'completed' && "bg-success border-success text-success-foreground",
                  stage.status === 'current' && "bg-primary border-primary text-primary-foreground animate-pulse",
                  stage.status === 'pending' && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Icon className={cn(
                  vertical ? "h-5 w-5" : "h-4 w-4"
                )} />
              </motion.div>
              
              {vertical && (
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-medium",
                      stage.status === 'completed' && "text-success",
                      stage.status === 'current' && "text-primary",
                      stage.status === 'pending' && "text-muted-foreground"
                    )}>
                      {stage.label}
                    </p>
                    {stage.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {stage.timestamp}
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
              )}
              
              {!vertical && (
                <div className="text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    stage.status === 'completed' && "text-success",
                    stage.status === 'current' && "text-primary",
                    stage.status === 'pending' && "text-muted-foreground"
                  )}>
                    {stage.label}
                  </p>
                  {stage.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stage.timestamp}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div className={cn(
                "transition-all duration-300",
                vertical ? "ml-5 w-0.5 h-6 -mt-2 mb-2" : "h-0.5 w-8 mx-2",
                stage.status === 'completed' ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Preset timeline configurations
export const getApplicationTimeline = (currentStage: string, role: 'applicant' | 'officer' | 'admin' = 'applicant') => {
  const baseStages: TimelineStage[] = [
    {
      id: 'submitted',
      label: 'Submitted',
      status: 'completed',
      description: 'Application form submitted',
    },
    {
      id: 'verified',
      label: 'Verified',
      status: currentStage === 'submitted' ? 'pending' : 'completed',
      description: 'Documents verified via OCR',
    },
    {
      id: 'scored',
      label: 'Scored',
      status: ['submitted', 'verified'].includes(currentStage) ? 'pending' : 
              currentStage === 'scored' ? 'current' : 'completed',
      description: 'AI credit scoring complete',
    },
    {
      id: 'officer_action',
      label: role === 'officer' ? 'Your Review' : 'Officer Review',
      status: ['submitted', 'verified', 'scored'].includes(currentStage) ? 'pending' :
              currentStage === 'officer_action' ? 'current' : 'completed',
      description: 'Loan officer review and decision',
    },
  ];

  return baseStages;
};