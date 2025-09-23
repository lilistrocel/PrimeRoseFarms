import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  Avatar,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Schedule,
  Agriculture,
  WaterDrop,
  BugReport,
  Add,
  Timer,
} from '@mui/icons-material';
import { IUser, ITask } from '../../../types';

interface MobileTasksPageProps {
  user: IUser;
}

// Sample task data - in real app this would come from API
const sampleTasks: ITask[] = [
  {
    id: '1',
    title: 'Water Block A3',
    description: 'Check soil moisture and water tomato plants in greenhouse A3',
    priority: 'urgent',
    type: 'watering',
    estimatedTime: 45,
    block: 'A3',
    status: 'pending',
    instructions: [
      'Check soil moisture sensor readings',
      'Adjust irrigation system if needed',
      'Record water usage',
      'Note any plant health issues',
    ],
    requirements: {
      tools: ['Moisture meter', 'Water quality tester'],
      materials: ['Water'],
      safety: ['Work gloves', 'Safety boots'],
    },
  },
  {
    id: '2',
    title: 'Harvest Lettuce - Block B1',
    description: 'Harvest mature lettuce from hydroponic Block B1',
    priority: 'high',
    type: 'harvest',
    estimatedTime: 90,
    block: 'B1',
    status: 'pending',
    instructions: [
      'Check lettuce maturity',
      'Harvest ready plants',
      'Sort by quality grade',
      'Record harvest quantities',
    ],
    requirements: {
      tools: ['Harvest knives', 'Quality scale', 'Containers'],
      materials: ['Harvest bags', 'Labels'],
      safety: ['Work gloves', 'Hair net'],
    },
  },
  {
    id: '3',
    title: 'Apply Fertilizer - Block C2',
    description: 'Apply NPK fertilizer to pepper plants in Block C2',
    priority: 'medium',
    type: 'fertilizing',
    estimatedTime: 60,
    block: 'C2',
    status: 'in_progress',
    instructions: [
      'Prepare fertilizer mixture',
      'Apply according to schedule',
      'Record application rate',
      'Update plant growth notes',
    ],
    requirements: {
      tools: ['Mixing tank', 'Application equipment'],
      materials: ['NPK fertilizer', 'Water'],
      safety: ['Chemical gloves', 'Eye protection', 'Respirator'],
    },
  },
];

const getPriorityColor = (priority: ITask['priority']) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'default';
  }
};

const getTaskIcon = (type: ITask['type']) => {
  switch (type) {
    case 'watering': return <WaterDrop />;
    case 'harvest': return <Agriculture />;
    case 'fertilizing': return <BugReport />;
    default: return <Schedule />;
  }
};

const TaskCard: React.FC<{
  task: ITask;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}> = ({ task, onStart, onComplete }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          {/* Task Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="flex-start" gap={2} flex={1}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {getTaskIcon(task.type)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.5 }}>
                  {task.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {task.description}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={task.priority.toUpperCase()} 
                    color={getPriorityColor(task.priority)} 
                    size="small" 
                  />
                  <Chip 
                    label={task.block} 
                    variant="outlined" 
                    size="small" 
                    icon={<Agriculture />}
                  />
                  <Chip 
                    label={`${task.estimatedTime} min`} 
                    variant="outlined" 
                    size="small" 
                    icon={<Timer />}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Progress for in-progress tasks */}
          {task.status === 'in_progress' && (
            <Box mb={2}>
              <LinearProgress 
                variant="indeterminate" 
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Task in progress...
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
            
            {task.status === 'pending' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => onStart(task.id)}
              >
                Start
              </Button>
            )}
            
            {task.status === 'in_progress' && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => onComplete(task.id)}
              >
                Complete
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {task.title}
          <Typography variant="body2" color="textSecondary">
            Block {task.block} • {task.estimatedTime} minutes
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
            Instructions:
          </Typography>
          <List dense>
            {task.instructions.map((instruction, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <Typography variant="body2">
                  {index + 1}. {instruction}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Requirements:
          </Typography>
          
          {task.requirements.tools && (
            <Box mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Tools needed:
              </Typography>
              <Typography variant="body2">
                {task.requirements.tools.join(', ')}
              </Typography>
            </Box>
          )}

          {task.requirements.materials && (
            <Box mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Materials:
              </Typography>
              <Typography variant="body2">
                {task.requirements.materials.join(', ')}
              </Typography>
            </Box>
          )}

          {task.requirements.safety && (
            <Box mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Safety equipment:
              </Typography>
              <Typography variant="body2">
                {task.requirements.safety.join(', ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const MobileTasksPage: React.FC<MobileTasksPageProps> = ({ user }) => {
  const [tasks, setTasks] = useState<ITask[]>(sampleTasks);

  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'in_progress' as const }
        : task
    ));
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const }
        : task
    ));
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Box sx={{ p: 2, pt: 3 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          My Tasks
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {pendingTasks.length} pending • {inProgressTasks.length} in progress
        </Typography>
      </Box>

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', fontWeight: 600 }}>
            In Progress ({inProgressTasks.length})
          </Typography>
          {inProgressTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
            />
          ))}
        </Box>
      )}

      {/* Pending Tasks */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Pending ({pendingTasks.length})
        </Typography>
        {pendingTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStart={handleStartTask}
            onComplete={handleCompleteTask}
          />
        ))}
      </Box>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 600 }}>
            Completed Today ({completedTasks.length})
          </Typography>
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
            />
          ))}
        </Box>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Agriculture sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks assigned
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Check back later for new tasks
          </Typography>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 100, // Above bottom navigation
          right: 16,
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default MobileTasksPage;
