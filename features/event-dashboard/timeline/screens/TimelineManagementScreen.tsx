import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TimelineDTO, TaskDTO } from '../../../../core/events/types/event';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onAddTask?: () => void;
};

export default function TimelineManagementScreen({ eventId, onBack, onAddTask }: Props) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy] = useState<'due_date' | 'priority' | 'status'>('due_date');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Sample timeline data
  const timeline: TimelineDTO = {
    id: '1',
    eventId,
    name: 'Event Planning Timeline',
    description: 'Complete timeline for event planning',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    tasks: [
      {
        id: '1',
        timelineId: '1',
        title: 'Book Venue',
        description: 'Reserve the main event venue',
        dueDate: '2024-01-15T00:00:00Z',
        priority: 'HIGH',
        status: 'COMPLETED',
        assignedTo: 'John Doe',
        estimatedHours: 4,
        actualHours: 3,
        dependencies: [],
        tags: ['venue', 'booking'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: '2',
        timelineId: '1',
        title: 'Send Invitations',
        description: 'Send out event invitations to all attendees',
        dueDate: '2024-01-20T00:00:00Z',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: 'Jane Smith',
        estimatedHours: 6,
        actualHours: 2,
        dependencies: ['1'],
        tags: ['invitations', 'communication'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '3',
        timelineId: '1',
        title: 'Order Catering',
        description: 'Finalize catering menu and place order',
        dueDate: '2024-01-25T00:00:00Z',
        priority: 'MEDIUM',
        status: 'PENDING',
        assignedTo: 'Mike Johnson',
        estimatedHours: 3,
        actualHours: 0,
        dependencies: ['1'],
        tags: ['catering', 'food'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  };

  const filteredTasks = useMemo(() => {
    try {
      let filtered = timeline.tasks;
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter((task: TaskDTO) => task.status === filterStatus.toUpperCase());
      }

      return filtered.sort((a: TaskDTO, b: TaskDTO) => {
        switch (sortBy) {
          case 'priority':
            const priorityOrder: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
      });
    } catch (err) {
      handleError(err, 'Filtering tasks');
      return [];
    }
  }, [filterStatus, sortBy, timeline.tasks, handleError]);

  const taskStats = useMemo(() => {
    try {
      const total = timeline.tasks.length;
      const completed = timeline.tasks.filter((t: TaskDTO) => t.status === 'COMPLETED').length;
      const inProgress = timeline.tasks.filter((t: TaskDTO) => t.status === 'IN_PROGRESS').length;
      const pending = timeline.tasks.filter((t: TaskDTO) => t.status === 'PENDING').length;
      
      return { total, completed, inProgress, pending };
    } catch (err) {
      handleError(err, 'Calculating task statistics');
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }
  }, [timeline.tasks, handleError]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return colors.semantic.error;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'LOW':
        return colors.semantic.success;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'IN_PROGRESS':
        return <Clock size={16} color={colors.semantic.warning} />;
      case 'PENDING':
        return <Circle size={16} color={colors.text.secondary} />;
      default:
        return <Circle size={16} color={colors.text.secondary} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ 
          color: colors.text.primary, 
          fontWeight: '700',
          fontSize: typography.size.lg
        }}>
          Event Timeline
        </Text>
        <TouchableOpacity 
          onPress={onAddTask}
          style={{ 
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <Plus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Timeline Overview - Compact */}
      <View style={{ 
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderColor: colors.border
      }}>
        <Text style={{ 
          color: colors.text.primary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.bold,
          marginBottom: spacing.xs
        }}>
          {timeline.name}
        </Text>
        {timeline.description && (
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            marginBottom: spacing.md
          }}>
            {timeline.description}
          </Text>
        )}
        
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md,
          marginTop: spacing.sm
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginBottom: spacing.xs
            }}>
              Total
            </Text>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold
            }}>
              {taskStats.total}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginBottom: spacing.xs
            }}>
              Completed
            </Text>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold
            }}>
              {taskStats.completed}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginBottom: spacing.xs
            }}>
              In Progress
            </Text>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold
            }}>
              {taskStats.inProgress}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginBottom: spacing.xs
            }}>
              Pending
            </Text>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold
            }}>
              {taskStats.pending}
            </Text>
          </View>
        </View>
      </View>

      {/* Filters - Compact */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.xl, 
          paddingVertical: spacing.md,
          gap: spacing.sm 
        }}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setFilterStatus(option.key as any)}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              backgroundColor: filterStatus === option.key ? brand.primary : colors.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: filterStatus === option.key ? brand.primary : colors.border
            }}
          >
            <Text style={{
              color: filterStatus === option.key ? colors.text.inverse : colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm
            }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tasks List */}
      <ScrollView 
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function TaskCard({ task }: { task: TaskDTO }) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} color={brand.primary} />;
      case 'IN_PROGRESS':
        return <Clock size={16} color={brand.primary} />;
      case 'PENDING':
        return <Circle size={16} color={colors.text.tertiary} />;
      default:
        return <Circle size={16} color={colors.text.tertiary} />;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            {getStatusIcon(task.status)}
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold
            }}>
              {task.title}
            </Text>
          </View>
          {task.description && (
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              lineHeight: 20
            }}>
              {task.description}
            </Text>
          )}
        </View>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: colors.background,
          borderRadius: borderRadius.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ 
            color: colors.text.secondary,
            fontWeight: typography.weight.medium,
            fontSize: typography.size.xs
          }}>
            {task.priority}
          </Text>
        </View>
      </View>

      {/* Compact Details Row */}
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.sm
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Calendar size={14} color={colors.text.tertiary} />
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: typography.size.xs
          }}>
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        </View>
        
        {task.estimatedHours > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Clock size={14} color={colors.text.tertiary} />
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs
            }}>
              {task.actualHours || 0}h / {task.estimatedHours}h
            </Text>
          </View>
        )}
        
        {task.assignedTo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.xs
            }}>
              {task.assignedTo}
            </Text>
          </View>
        )}
      </View>

      {/* Time Tracking - Clean Design */}
      {task.estimatedHours > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: spacing.xs,
          marginBottom: spacing.xs
        }}>
          <Text style={{
            color: colors.text.tertiary,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.regular
          }}>
            {task.actualHours || 0}h / {task.estimatedHours}h
          </Text>
        </View>
      )}

      {/* Tags - Compact */}
      {task.tags && task.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {task.tags.map((tag: string) => (
            <View
              key={tag}
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: colors.background,
                borderRadius: borderRadius.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ 
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium
              }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
