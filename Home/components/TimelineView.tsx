import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TaskDTO } from '../../types/timeline';

type Props = {
  tasks: TaskDTO[];
  eventId: string;
};

type TaskRowProps = {
  task: TaskDTO;
  isSubtask: boolean;
  taskDate: string;
  dates: string[];
  dateColumnWidth: number;
  datesTotalWidth: number;
  colors: any;
  typography: any;
  spacing: any;
  borderRadius: any;
  getStatusColor: (status: string) => string;
  getTaskProgress: (task: TaskDTO) => number;
  onScrollSync: (scrollX: number) => void;
  rowIndex: number;
};

// Memoized task row component for better performance
const TaskRow = React.memo(({
  task,
  isSubtask,
  taskDate,
  dates,
  dateColumnWidth,
  datesTotalWidth,
  colors,
  typography,
  spacing,
  borderRadius,
  getStatusColor,
  getTaskProgress,
  onScrollSync,
}: TaskRowProps) => {
  const progress = getTaskProgress(task);
  const statusColor = getStatusColor(task.status);
  const isCompleted = task.status === 'COMPLETED';
  const TASK_COLUMN_WIDTH = 140;

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: isSubtask ? colors.surface : colors.background,
        minHeight: isSubtask ? 48 : 56,
      }}
    >
      {/* Fixed Task Name Column - Compact */}
      <View style={{
        width: TASK_COLUMN_WIDTH,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRightWidth: 1.5,
        borderColor: colors.border,
        justifyContent: 'center',
      }}>
        {isSubtask && (
          <View style={{ 
            width: 12, 
            alignItems: 'center', 
            paddingTop: 1,
            marginBottom: 1
          }}>
            <View style={{
              width: 1,
              height: 12,
              backgroundColor: colors.border,
              marginTop: 3
            }} />
          </View>
        )}
        <View>
          <Text 
            numberOfLines={2}
            style={{
              color: isCompleted ? colors.text.tertiary : colors.text.primary,
              fontSize: isSubtask ? 11 : 12,
              fontWeight: isSubtask ? typography.weight.regular : typography.weight.semibold,
              letterSpacing: -0.1,
              lineHeight: isSubtask ? 14 : 16,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </Text>
          
          {/* Compact assignee - only for parent tasks */}
          {!isSubtask && task.assignedTo && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 3,
              marginTop: 3
            }}>
              <User size={9} color={colors.text.tertiary} strokeWidth={2} />
              <Text 
                numberOfLines={1}
                style={{
                  color: colors.text.tertiary,
                  fontSize: 9,
                  fontWeight: typography.weight.regular,
                }}
              >
                {task.assignedTo}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Scrollable Date Columns */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          onScrollSync(e.nativeEvent.contentOffset.x);
        }}
        style={{ flex: 1 }}
        bounces={false}
      >
        <View style={{ flexDirection: 'row', width: datesTotalWidth }}>
          {dates.map((dateStr, index) => {
            const isTaskDate = dateStr === taskDate;

            return (
              <View
                key={index}
                style={{
                  width: dateColumnWidth,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.xs,
                  borderRightWidth: index < dates.length - 1 ? 1 : 0,
                  borderColor: colors.borderLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isSubtask ? 48 : 56,
                }}
              >
                {isTaskDate && (
                  <View style={{ alignItems: 'center', gap: spacing.xs, width: '100%' }}>
                    {task.subtasks && task.subtasks.length > 0 ? (
                      <View style={{
                        width: '100%',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <View style={{
                          width: '100%',
                          height: 5,
                          backgroundColor: colors.surface,
                          borderRadius: borderRadius.full,
                          overflow: 'hidden',
                          borderWidth: 0.5,
                          borderColor: colors.border
                        }}>
                          <View style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: statusColor,
                            borderRadius: borderRadius.full
                          }} />
                        </View>
                        <Text style={{
                          color: colors.text.primary,
                          fontSize: 10,
                          fontWeight: typography.weight.semibold,
                        }}>
                          {progress}%
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: statusColor,
                        borderWidth: isCompleted ? 0 : 1,
                        borderColor: colors.surface
                      }} />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
});

export default function TimelineView({ tasks, eventId }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const headerScrollRef = useRef<ScrollView>(null);
  const rowScrollRefs = useRef<(ScrollView | null)[]>([]);
  const scrollSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract all dates from tasks and subtasks
  const dates = useMemo(() => {
    const dateSet = new Set<string>();
    const processTask = (task: TaskDTO) => {
      const date = new Date(task.dueDate);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const dateStr = `${day} ${month}`;
      dateSet.add(dateStr);
      if (task.subtasks) {
        task.subtasks.forEach(processTask);
      }
    };
    tasks.forEach(processTask);
    
    return Array.from(dateSet).sort((a, b) => {
      const [dayA, monthA] = a.split(' ');
      const [dayB, monthB] = b.split(' ');
      const year = new Date().getFullYear();
      const dateA = new Date(`${monthA} ${dayA}, ${year}`);
      const dateB = new Date(`${monthB} ${dayB}, ${year}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [tasks]);

  // Get task date string
  const getTaskDate = useCallback((dueDate: string) => {
    const date = new Date(dueDate);
    return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}`;
  }, []);

  // Get all tasks and subtasks flattened
  const allTasks = useMemo(() => {
    const flatten = (task: TaskDTO, parent: TaskDTO | undefined = undefined): Array<{ task: TaskDTO; parent: TaskDTO | undefined; isSubtask: boolean }> => {
      const result = [{ task, parent, isSubtask: !!parent }];
      if (task.subtasks) {
        task.subtasks.forEach(subtask => {
          result.push(...flatten(subtask, task));
        });
      }
      return result;
    };
    const flattened = tasks.flatMap(task => flatten(task));
    rowScrollRefs.current = new Array(flattened.length).fill(null);
    return flattened;
  }, [tasks]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.semantic.success;
      case 'IN_PROGRESS':
        return colors.semantic.warning;
      case 'PENDING':
        return colors.text.tertiary;
      default:
        return colors.text.tertiary;
    }
  }, [colors]);

  // Calculate progress for tasks with subtasks
  const getTaskProgress = useCallback((task: TaskDTO) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      if (task.status === 'COMPLETED') return 100;
      if (task.status === 'IN_PROGRESS') return task.estimatedHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 50;
      return 0;
    }
    const completed = task.subtasks.filter(st => st.status === 'COMPLETED').length;
    return Math.round((completed / task.subtasks.length) * 100);
  }, []);

  const DATE_COLUMN_WIDTH = 85;
  const TASK_COLUMN_WIDTH = 140;
  const datesTotalWidth = dates.length * DATE_COLUMN_WIDTH;

  // Optimized scroll sync with debouncing
  const syncScrolls = useCallback((scrollX: number, skipRef?: ScrollView | null) => {
    // Clear existing timeout
    if (scrollSyncTimeoutRef.current) {
      clearTimeout(scrollSyncTimeoutRef.current);
    }

    // Debounce the sync operation
    scrollSyncTimeoutRef.current = setTimeout(() => {
      // Sync header
      if (headerScrollRef.current && headerScrollRef.current !== skipRef) {
        headerScrollRef.current.scrollTo({ x: scrollX, animated: false });
      }
      
      // Sync all rows (but skip the source to avoid recursion)
      rowScrollRefs.current.forEach((ref) => {
        if (ref && ref !== skipRef) {
          ref.scrollTo({ x: scrollX, animated: false });
        }
      });
    }, 8); // Small debounce for better performance
  }, []);

  // Handler for row scroll sync
  const handleRowScroll = useCallback((scrollX: number, rowIndex: number) => {
    syncScrolls(scrollX, rowScrollRefs.current[rowIndex]);
  }, [syncScrolls]);

  // Handler for header scroll sync
  const handleHeaderScroll = useCallback((scrollX: number) => {
    syncScrolls(scrollX, headerScrollRef.current);
  }, [syncScrolls]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header Row */}
      <View style={{ 
        flexDirection: 'row', 
        borderBottomWidth: 1.5, 
        borderColor: colors.border,
        backgroundColor: colors.surface,
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}>
        {/* Fixed Task Name Column Header - Compact */}
        <View style={{ 
          width: TASK_COLUMN_WIDTH, 
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm, 
          borderRightWidth: 1.5, 
          borderColor: colors.border,
          justifyContent: 'center'
        }}>
          <Text style={{ 
            color: colors.text.tertiary, 
            fontSize: 9, 
            fontWeight: typography.weight.bold,
            textTransform: 'uppercase',
            letterSpacing: 0.3
          }}>
            TASK
          </Text>
        </View>
        
        {/* Scrollable Date Columns Header */}
        <ScrollView 
          ref={headerScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={true}
          onScroll={(e) => {
            handleHeaderScroll(e.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={32}
          style={{ flex: 1 }}
          bounces={false}
        >
          <View style={{ flexDirection: 'row', width: datesTotalWidth }}>
            {dates.map((dateStr, index) => {
              const [day, month] = dateStr.split(' ');
              return (
                <View
                  key={index}
                  style={{
                    width: DATE_COLUMN_WIDTH,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xs,
                    borderRightWidth: index < dates.length - 1 ? 1 : 0,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: 20,
                    fontWeight: typography.weight.bold,
                    letterSpacing: -0.3,
                    lineHeight: 24
                  }}>
                    {day}
                  </Text>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: 9,
                    fontWeight: typography.weight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginTop: 1
                  }}>
                    {month}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Tasks Rows - Optimized with memoized components */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
      >
        {allTasks.map(({ task, parent, isSubtask }, index) => {
          const taskDate = getTaskDate(task.dueDate);
          
          return (
            <TaskRow
              key={task.id}
              task={task}
              isSubtask={isSubtask}
              taskDate={taskDate}
              dates={dates}
              dateColumnWidth={DATE_COLUMN_WIDTH}
              datesTotalWidth={datesTotalWidth}
              colors={colors}
              typography={typography}
              spacing={spacing}
              borderRadius={borderRadius}
              getStatusColor={getStatusColor}
              getTaskProgress={getTaskProgress}
              onScrollSync={(scrollX) => handleRowScroll(scrollX, index)}
              rowIndex={index}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
