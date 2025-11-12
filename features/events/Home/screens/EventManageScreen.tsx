import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, List, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import TimelineView from '../components/TimelineView';
import ListView from '../components/ListView';
import { TaskDTO } from '../../../../shared/types/timeline';

type RouteParams = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  initialView?: 'list' | 'timeline';
};

type Props = {
  route: { params: RouteParams };
};

export default function EventManageScreen({ route }: Props) {
  const { id, title, date, location, imageUrl, initialView } = route.params || {};
  const { colors, spacing, borderRadius, typography, brand } = useTheme();
  const navigation = useNavigation<any>();
  const [taskView, setTaskView] = useState<'list' | 'timeline'>(initialView || 'list');
  const [taskFilter, setTaskFilter] = useState<'all' | 'to_do' | 'active' | 'done'>('all');
  
  // Update view when initialView changes
  useEffect(() => {
    if (initialView) {
      setTaskView(initialView);
    }
  }, [initialView]);

  // Sample tasks data - in production, this would come from the API
  const tasks: TaskDTO[] = useMemo(() => [
    {
      id: '1',
      timelineId: '1',
      title: 'Venue Setup',
      description: 'Coordinate with venue management',
      dueDate: '2024-05-19T00:00:00Z',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Sarah M.',
      estimatedHours: 8,
      actualHours: 3,
      dependencies: [],
      tags: ['LOGISTICS'],
      subtasks: [
        {
          id: '1-1',
          timelineId: '1',
          title: 'Book main stage',
          description: 'Reserve main stage',
          dueDate: '2024-05-09T00:00:00Z',
          priority: 'HIGH',
          status: 'COMPLETED',
          assignedTo: 'Sarah M.',
          estimatedHours: 2,
          actualHours: 2,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-05-09T00:00:00Z'
        },
        {
          id: '1-2',
          timelineId: '1',
          title: 'Arrange seating',
          description: 'Set up seating arrangements',
          dueDate: '2024-05-17T00:00:00Z',
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedTo: 'John D.',
          estimatedHours: 4,
          actualHours: 0,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '1-3',
          timelineId: '1',
          title: 'Setup sound system',
          description: 'Install and test sound equipment',
          dueDate: '2024-05-19T00:00:00Z',
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedTo: 'Mike R.',
          estimatedHours: 2,
          actualHours: 0,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-05-15T00:00:00Z'
    },
    {
      id: '2',
      timelineId: '1',
      title: 'Marketing Campaign',
      description: 'Launch social media and email campaigns',
      dueDate: '2024-05-24T00:00:00Z',
      priority: 'MEDIUM',
      status: 'PENDING',
      assignedTo: 'Emma L.',
      estimatedHours: 6,
      actualHours: 0,
      dependencies: [],
      tags: ['MARKETING'],
      subtasks: [
        {
          id: '2-1',
          timelineId: '1',
          title: 'Design promotional posters',
          description: 'Create marketing materials',
          dueDate: '2024-05-20T00:00:00Z',
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedTo: 'Emma L.',
          estimatedHours: 3,
          actualHours: 0,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2-2',
          timelineId: '1',
          title: 'Schedule social posts',
          description: 'Plan and schedule social media content',
          dueDate: '2024-05-22T00:00:00Z',
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedTo: 'Emma L.',
          estimatedHours: 3,
          actualHours: 0,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      timelineId: '1',
      title: 'Catering Arrangements',
      description: 'Finalize food vendors and menu',
      dueDate: '2024-05-09T00:00:00Z',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      assignedTo: 'Carlos P.',
      estimatedHours: 4,
      actualHours: 4,
      dependencies: [],
      tags: ['CATERING'],
      subtasks: [
        {
          id: '3-1',
          timelineId: '1',
          title: 'Contact food trucks',
          description: 'Reach out to food vendors',
          dueDate: '2024-05-07T00:00:00Z',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          assignedTo: 'Carlos P.',
          estimatedHours: 2,
          actualHours: 2,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-05-07T00:00:00Z'
        },
        {
          id: '3-2',
          timelineId: '1',
          title: 'Finalize menu',
          description: 'Confirm final menu selections',
          dueDate: '2024-05-09T00:00:00Z',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          assignedTo: 'Carlos P.',
          estimatedHours: 2,
          actualHours: 2,
          dependencies: [],
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-05-09T00:00:00Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-05-09T00:00:00Z'
    }
  ], []);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const allTasks = tasks.flatMap(t => [t, ...(t.subtasks || [])]);
    const completed = allTasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / allTasks.length) * 100);
  }, [tasks]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header with Progress */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.md
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
              color: colors.text.primary
            }}>
              {title}
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              marginTop: spacing.xs
            }}>
              Tasks & Timeline
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: spacing.sm 
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium
            }}>
              Progress
            </Text>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold
            }}>
              {overallProgress}%
            </Text>
          </View>
          <View style={{
            height: 6,
            backgroundColor: colors.border,
            borderRadius: borderRadius.full,
            overflow: 'hidden'
          }}>
            <View style={{
              width: `${overallProgress}%`,
              height: '100%',
              backgroundColor: colors.brand.primary,
              borderRadius: borderRadius.full
            }} />
          </View>
        </View>
      </View>

      {/* View Toggle */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xs,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        gap: spacing.xs
      }}>
        <TouchableOpacity
          onPress={() => setTaskView('list')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            backgroundColor: taskView === 'list' ? colors.brand.primary : 'transparent'
          }}
        >
          <List size={16} color={taskView === 'list' ? colors.text.inverse : colors.text.secondary} />
          <Text style={{
            color: taskView === 'list' ? colors.text.inverse : colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium
          }}>
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTaskView('timeline')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            backgroundColor: taskView === 'timeline' ? colors.brand.primary : 'transparent'
          }}
        >
          <BarChart3 size={16} color={taskView === 'timeline' ? colors.text.inverse : colors.text.secondary} />
          <Text style={{
            color: taskView === 'timeline' ? colors.text.inverse : colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium
          }}>
            Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Content */}
      {taskView === 'list' ? (
        <ListView
          tasks={tasks}
          filterStatus={taskFilter}
          onFilterChange={setTaskFilter}
        />
      ) : (
        <TimelineView tasks={tasks} eventId={id} />
      )}
    </SafeAreaView>
  );
}
