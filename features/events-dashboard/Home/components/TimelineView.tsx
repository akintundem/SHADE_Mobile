import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TaskDTO } from '../../timeline/types/timeline';

type Props = {
  tasks: TaskDTO[];
  eventId: string;
};

type TaskRowProps = {
  task: TaskDTO;
  isSubtask: boolean;
  taskStartDate: string;
  taskEndDate: string;
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
  scrollRef: (ref: ScrollView | null) => void;
};

// Memoized task row component for better performance
const TaskRow = React.memo(({
  task,
  isSubtask,
  taskStartDate,
  taskEndDate,
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
  scrollRef,
}: TaskRowProps) => {
  const progress = getTaskProgress(task);
  const statusColor = getStatusColor(task.status);
  const isCompleted = task.status === 'COMPLETED';
  const TASK_COLUMN_WIDTH = 180;
  
  // Find which date columns this task spans
  const getDateIndex = (dateStr: string) => {
    return dates.findIndex(d => d === dateStr);
  };
  
  const startIndex = getDateIndex(taskStartDate);
  const endIndex = getDateIndex(taskEndDate);
  const spansMultipleDates = startIndex >= 0 && endIndex >= 0 && endIndex > startIndex;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isSubtask ? colors.surface : colors.cardElevated,
        minHeight: isSubtask ? 60 : 72,
        marginBottom: 2,
      }}
    >
      {/* Fixed Task Name Column */}
      <View style={{
        width: TASK_COLUMN_WIDTH,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        backgroundColor: isSubtask ? colors.surface : colors.cardElevated,
      }}>
        <View style={{ marginLeft: isSubtask ? spacing.md : 0 }}>
          <Text 
            numberOfLines={2}
            style={{
              color: isCompleted ? colors.text.tertiary : colors.text.primary,
              fontSize: isSubtask ? typography.size.sm : typography.size.base,
              fontFamily: isSubtask ? typography.family.regular : typography.family.semibold,
              fontWeight: isSubtask ? typography.weight.regular : typography.weight.semibold,
              lineHeight: isSubtask ? 18 : 20,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </Text>
          
          {/* Assignee - only for parent tasks */}
          {!isSubtask && task.assignedTo && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 4,
              marginTop: 4
            }}>
              <User size={10} color={colors.text.tertiary} strokeWidth={2} />
              <Text 
                numberOfLines={1}
                style={{
                  color: colors.text.tertiary,
                  fontSize: 10,
                  fontFamily: typography.family.medium,
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
        ref={scrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          onScrollSync(e.nativeEvent.contentOffset.x);
        }}
        style={{ flex: 1 }}
        bounces={false}
      >
        <View style={{ flexDirection: 'row', width: datesTotalWidth, position: 'relative' }}>
          {/* Task bar that spans multiple dates - Clean Minimal Design */}
          {spansMultipleDates && startIndex >= 0 && endIndex >= 0 && (
            <View
              style={{
                position: 'absolute',
                left: startIndex * dateColumnWidth + 8,
                width: (endIndex - startIndex + 1) * dateColumnWidth - 16,
                top: '50%',
                marginTop: -4,
                height: 8,
                zIndex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{
                width: '100%',
                height: 4,
                backgroundColor: statusColor,
                borderRadius: borderRadius.full,
                opacity: isCompleted ? 0.3 : 1,
              }} />
            </View>
          )}
          
          {dates.map((dateStr, index) => {
            const isInTaskRange = spansMultipleDates 
              ? index >= startIndex && index <= endIndex
              : dateStr === taskStartDate || dateStr === taskEndDate;

            return (
              <View
                key={index}
                style={{
                  width: dateColumnWidth,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isSubtask ? 56 : 64,
                  backgroundColor: isSubtask ? colors.surface : colors.cardElevated,
                }}
              >
                {/* Single date indicator (when task doesn't span) - Clean Minimal Design */}
                {!spansMultipleDates && isInTaskRange && (
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <View style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: statusColor,
                      opacity: isCompleted ? 0.4 : 1,
                    }} />
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
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
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

  // Calculate task start and end dates
  const getTaskDateRange = useCallback((task: TaskDTO) => {
    const dueDate = new Date(task.dueDate);
    const dueDateStr = getTaskDate(task.dueDate);
    
    // Calculate start date based on estimated hours (assuming 8 hours per day)
    // If no estimated hours, start 3 days before due date
    const daysToSubtract = task.estimatedHours > 0 
      ? Math.max(1, Math.ceil(task.estimatedHours / 8))
      : 3;
    
    const startDate = new Date(dueDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    const startDateStr = getTaskDate(startDate.toISOString());
    
    return { startDateStr, endDateStr: dueDateStr };
  }, [getTaskDate]);

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
        return brand.primary;
      case 'IN_PROGRESS':
        return brand.primary;
      case 'PENDING':
        return colors.text.tertiary;
      default:
        return colors.text.tertiary;
    }
  }, [colors, brand]);

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

  const DATE_COLUMN_WIDTH = 100;
  const TASK_COLUMN_WIDTH = 180;
  const datesTotalWidth = dates.length * DATE_COLUMN_WIDTH;

  const scrollSyncRef = useRef<number | null>(null);

  // Optimized scroll sync with requestAnimationFrame to prevent flickering
  const syncScrolls = useCallback((scrollX: number, skipRef?: ScrollView | null) => {
    // Cancel any pending sync
    if (scrollSyncRef.current !== null) {
      cancelAnimationFrame(scrollSyncRef.current);
    }

    // Use requestAnimationFrame for smooth syncing
    scrollSyncRef.current = requestAnimationFrame(() => {
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
      
      scrollSyncRef.current = null;
    });
  }, []);

  // Handler for row scroll sync
  const handleRowScroll = useCallback((scrollX: number, rowIndex: number) => {
    const sourceRef = rowScrollRefs.current[rowIndex];
    syncScrolls(scrollX, sourceRef);
  }, [syncScrolls]);

  // Handler for header scroll sync
  const handleHeaderScroll = useCallback((scrollX: number) => {
    syncScrolls(scrollX, headerScrollRef.current);
  }, [syncScrolls]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header Row - Enhanced Design */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: colors.surface,
      }}>
        {/* Fixed Task Name Column Header */}
        <View style={{ 
          width: TASK_COLUMN_WIDTH, 
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.md, 
          justifyContent: 'center',
          backgroundColor: colors.surface,
        }}>
          <Text style={{ 
            color: colors.text.tertiary, 
            fontSize: 10, 
            fontFamily: typography.family.bold,
            fontWeight: typography.weight.bold,
            letterSpacing: 0.5,
            textTransform: 'uppercase'
          }}>
            Tasks
          </Text>
        </View>
        
        {/* Scrollable Date Columns Header */}
        <ScrollView 
          ref={headerScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            handleHeaderScroll(e.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
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
                    paddingHorizontal: spacing.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.lg,
                    fontFamily: typography.family.bold,
                    fontWeight: typography.weight.bold,
                    lineHeight: 20
                  }}>
                    {day}
                  </Text>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: 10,
                    fontFamily: typography.family.bold,
                    fontWeight: typography.weight.bold,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginTop: 2
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
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {allTasks.map(({ task, parent, isSubtask }, index) => {
          const { startDateStr, endDateStr } = getTaskDateRange(task);
          
          return (
            <TaskRow
              key={task.id}
              task={task}
              isSubtask={isSubtask}
              taskStartDate={startDateStr}
              taskEndDate={endDateStr}
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
              scrollRef={(ref) => {
                rowScrollRefs.current[index] = ref;
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
