import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Easing,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { TaskDetailResponse, TimelineStatus } from '../../../../core/timeline/types/timeline';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { dateUtils } from '../../../../common/utils/helpers';
import { useTheme } from '../../../../common/theme/ThemeProvider';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  tasks: TaskDetailResponse[];
  onTaskPress?: (task: TaskDetailResponse) => void;
  onTaskLongPress?: (task: TaskDetailResponse) => void;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_DAY_WIDTH = 34;
const MIN_DAY_WIDTH = 18;
const MAX_DAY_WIDTH = 60;
const SNAP_INCREMENTS = [18, 24, 34, 44, 60];

function snapToIncrement(value: number): number {
  let closest = SNAP_INCREMENTS[0];
  let minDist = Math.abs(value - closest);
  for (const snap of SNAP_INCREMENTS) {
    const dist = Math.abs(value - snap);
    if (dist < minDist) {
      minDist = dist;
      closest = snap;
    }
  }
  return closest;
}

// Animated bar with staggered fade+lift entry
function AnimatedTaskBar({
  children,
  index,
  style,
  onPress,
  onLongPress,
}: {
  children: React.ReactNode;
  index: number;
  style: object;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        delay: index * 35,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 260,
        delay: index * 35,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[style, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function GanttChart({ tasks, onTaskPress, onTaskLongPress }: Props) {
  const { colors, spacing, typography, isDark } = useTheme();
  const { t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();

  // Pinch-to-zoom state
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const pinchBaseWidth = useRef(DEFAULT_DAY_WIDTH);
  const pinchBaseDist = useRef<number | null>(null);

  // Label column collapse
  const [labelsCollapsed, setLabelsCollapsed] = useState(false);

  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const timelineScrollRef = useRef<ScrollView>(null);

  // FAB "Jump to Today"
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const [showFab, setShowFab] = useState(false);
  const fabVisible = useRef(false);

  const layout = useMemo(() => {
    const fullLabelWidth = Math.min(Math.max(Math.round(screenWidth * 0.28), 110), 180);
    const labelColumnWidth = labelsCollapsed ? 32 : fullLabelWidth;
    const rowHeight = screenWidth < 360 ? 56 : 64;
    return { dayWidth, labelColumnWidth, fullLabelWidth, rowHeight };
  }, [screenWidth, dayWidth, labelsCollapsed]);

  // Timeline date range
  const timelineRange = useMemo(() => {
    const fallback = () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
      return { start, end, days: Math.ceil((end.getTime() - start.getTime()) / DAY_MS) + 1 };
    };

    if (tasks.length === 0) return fallback();

    const allDates: number[] = [];
    tasks.forEach(task => {
      if (task.startDate) allDates.push(new Date(task.startDate).getTime());
      if (task.dueDate) allDates.push(new Date(task.dueDate).getTime());
    });
    if (allDates.length === 0) return fallback();

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    // Pad 2 weeks on each side so bars don't hug the edge
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    start.setDate(start.getDate() - 7);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);

    return { start, end, days: Math.ceil((end.getTime() - start.getTime()) / DAY_MS) + 1 };
  }, [tasks]);

  const dayHeaders = useMemo(() => {
    const days: {
      key: number;
      day: string;
      weekDay: string;
      weekDayShort: string;
      isToday: boolean;
      isWeekend: boolean;
      isMonthStart: boolean;
    }[] = [];
    const current = new Date(timelineRange.start);
    const end = new Date(timelineRange.end);
    while (current <= end) {
      const date = new Date(current);
      days.push({
        key: date.getTime(),
        day: String(date.getDate()),
        weekDay: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
        weekDayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateUtils.isToday(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isMonthStart: date.getDate() === 1,
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [timelineRange]);

  const monthHeaders = useMemo(() => {
    const headers: { month: string; days: number }[] = [];
    let current = new Date(timelineRange.start);
    const end = new Date(timelineRange.end);
    while (current <= end) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const actualStart = monthStart < timelineRange.start ? timelineRange.start : monthStart;
      const actualEnd = monthEnd > end ? end : monthEnd;
      const days = Math.ceil((actualEnd.getTime() - actualStart.getTime()) / DAY_MS) + 1;
      headers.push({ month: dateUtils.formatDate(monthStart.toISOString(), 'MMM yyyy'), days });
      current = new Date(monthEnd);
      current.setDate(current.getDate() + 1);
    }
    return headers;
  }, [timelineRange]);

  const todayOffset = useMemo(() => {
    const today = new Date();
    if (today < timelineRange.start || today > timelineRange.end) return null;
    const daysFromStart = Math.floor((today.getTime() - timelineRange.start.getTime()) / DAY_MS);
    // Center of today's column
    return daysFromStart * layout.dayWidth + layout.dayWidth / 2;
  }, [layout.dayWidth, timelineRange]);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (todayOffset === null) return;
    const timer = setTimeout(() => {
      const available = screenWidth - layout.labelColumnWidth;
      const scrollX = Math.max(0, todayOffset - available / 2);
      timelineScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      monthScrollRef.current?.scrollTo({ x: scrollX, animated: false });
      dayScrollRef.current?.scrollTo({ x: scrollX, animated: false });
    }, 350);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FAB logic
  const updateFab = useCallback((scrollX: number) => {
    if (todayOffset === null) return;
    const available = screenWidth - layout.labelColumnWidth;
    const targetX = Math.max(0, todayOffset - available / 2);
    const shouldShow = Math.abs(scrollX - targetX) > available * 0.4;

    if (shouldShow && !fabVisible.current) {
      fabVisible.current = true;
      setShowFab(true);
      Animated.timing(fabOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else if (!shouldShow && fabVisible.current) {
      fabVisible.current = false;
      Animated.timing(fabOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
        setShowFab(false)
      );
    }
  }, [todayOffset, screenWidth, layout.labelColumnWidth, fabOpacity]);

  const handleTimelineScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      monthScrollRef.current?.scrollTo({ x, animated: false });
      dayScrollRef.current?.scrollTo({ x, animated: false });
      updateFab(x);
    },
    [updateFab]
  );

  const handleJumpToToday = useCallback(() => {
    if (todayOffset === null) return;
    const available = screenWidth - layout.labelColumnWidth;
    const scrollX = Math.max(0, todayOffset - available / 2);
    timelineScrollRef.current?.scrollTo({ x: scrollX, animated: true });
    monthScrollRef.current?.scrollTo({ x: scrollX, animated: false });
    dayScrollRef.current?.scrollTo({ x: scrollX, animated: false });
  }, [todayOffset, screenWidth, layout.labelColumnWidth]);

  const handleToggleLabels = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLabelsCollapsed(v => !v);
  }, []);

  // Pinch-to-zoom
  const pinchResponder = useMemo(() => {
    function dist(touches: any[]): number | null {
      if (touches.length < 2) return null;
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return PanResponder.create({
      onStartShouldSetPanResponder: evt => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: evt => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: evt => {
        const d = dist(evt.nativeEvent.touches as any[]);
        if (d !== null) { pinchBaseDist.current = d; pinchBaseWidth.current = dayWidth; }
      },
      onPanResponderMove: evt => {
        const d = dist(evt.nativeEvent.touches as any[]);
        if (d === null || pinchBaseDist.current === null) return;
        const next = Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, pinchBaseWidth.current * (d / pinchBaseDist.current)));
        setDayWidth(next);
      },
      onPanResponderRelease: () => {
        setDayWidth(w => snapToIncrement(w));
        pinchBaseDist.current = null;
      },
      onPanResponderTerminate: () => {
        setDayWidth(w => snapToIncrement(w));
        pinchBaseDist.current = null;
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayWidth]);

  const getStatusColor = (status: TimelineStatus | null | undefined) => {
    switch (status) {
      case TimelineStatus.COMPLETED:
      case TimelineStatus.DONE:        return colors.semantic.success;
      case TimelineStatus.IN_PROGRESS:
      case TimelineStatus.ACTIVE:      return colors.semantic.info;
      case TimelineStatus.OVERDUE:     return colors.semantic.error;
      case TimelineStatus.CANCELLED:   return colors.text.tertiary;
      default:                         return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: TimelineStatus | null | undefined): string => {
    switch (status) {
      case TimelineStatus.COMPLETED:
      case TimelineStatus.DONE:        return 'Done';
      case TimelineStatus.IN_PROGRESS:
      case TimelineStatus.ACTIVE:      return 'Active';
      case TimelineStatus.OVERDUE:     return 'Overdue';
      case TimelineStatus.CANCELLED:   return 'Cancelled';
      default:                         return 'Todo';
    }
  };

  const getTaskPosition = (task: TaskDetailResponse) => {
    const { start } = timelineRange;
    const minBarWidth = Math.max(layout.dayWidth * 2, 48);

    let taskStart: Date;
    let taskEnd: Date;

    if (task.startDate) {
      taskStart = new Date(task.startDate);
    } else if (task.dueDate) {
      taskStart = new Date(task.dueDate);
      taskStart.setDate(taskStart.getDate() - 7);
    } else {
      return { left: 0, width: Math.max(7 * layout.dayWidth, minBarWidth), isMilestone: false };
    }

    if (task.dueDate) {
      taskEnd = new Date(task.dueDate);
    } else {
      taskEnd = new Date(taskStart);
      taskEnd.setDate(taskEnd.getDate() + 7);
    }

    const isMilestone =
      task.startDate && task.dueDate &&
      new Date(task.startDate).toDateString() === new Date(task.dueDate).toDateString();

    if (taskStart < start) taskStart = new Date(start);
    if (taskEnd > timelineRange.end) taskEnd = new Date(timelineRange.end);

    const daysFromStart = Math.max(0, Math.floor((taskStart.getTime() - start.getTime()) / DAY_MS));
    const duration = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / DAY_MS));

    return {
      left: daysFromStart * layout.dayWidth,
      width: Math.max(duration * layout.dayWidth, minBarWidth),
      isMilestone: !!isMilestone,
    };
  };

  const totalWidth = timelineRange.days * layout.dayWidth;
  const barHeight = layout.rowHeight - spacing.md - 4;
  const pillRadius = barHeight / 2;

  // Surface colors — Wealthsimple-ish: very clean, barely-there tints
  const headerBg = isDark ? '#111111' : '#FAFAFA';
  const labelBg = isDark ? '#111111' : '#FFFFFF';
  const contentBg = isDark ? '#0A0A0A' : '#FAFAFA';
  const borderCol = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const weekendTint = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
  const todayCol = colors.semantic.warning;

  if (tasks.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.primary, marginBottom: spacing.xs }}>
          {t('NoTasksYet')}
        </Text>
        <Text style={{ fontSize: typography.size.xs, color: colors.text.tertiary, lineHeight: typography.size.xs * 1.5 }}>
          {t('AddYourFirstTask')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: contentBg }} {...pinchResponder.panHandlers}>

      {/* ── Sticky header: single combined month+day strip ── */}
      <View style={{ backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: borderCol }}>
        <View style={{ flexDirection: 'row' }}>

          {/* Label column header — collapse toggle */}
          <TouchableOpacity
            onPress={handleToggleLabels}
            activeOpacity={0.7}
            style={{
              width: layout.labelColumnWidth,
              paddingHorizontal: spacing.sm,
              paddingVertical: 10,
              borderRightWidth: 1,
              borderRightColor: borderCol,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: labelsCollapsed ? 'center' : 'space-between',
              backgroundColor: labelBg,
            }}
          >
            {!labelsCollapsed && (
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Tasks
              </Text>
            )}
            {labelsCollapsed
              ? <ChevronRight size={12} color={colors.text.tertiary} strokeWidth={2.5} />
              : <ChevronLeft size={12} color={colors.text.tertiary} strokeWidth={2.5} />
            }
          </TouchableOpacity>

          {/* Month + day columns */}
          <View style={{ flex: 1, overflow: 'hidden' }}>
            {/* Month strip */}
            <ScrollView
              ref={monthScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row', minWidth: totalWidth }}>
                {monthHeaders.map((header, index) => (
                  <View
                    key={header.month}
                    style={{
                      width: header.days * layout.dayWidth,
                      paddingHorizontal: spacing.sm,
                      paddingTop: 7,
                      paddingBottom: 3,
                      borderRightWidth: index < monthHeaders.length - 1 ? 1 : 0,
                      borderRightColor: borderCol,
                    }}
                  >
                    <Text style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                    }}>
                      {header.month}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Day strip */}
            <ScrollView
              ref={dayScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row', minWidth: totalWidth, borderTopWidth: 1, borderTopColor: borderCol }}>
                {dayHeaders.map((day) => (
                  <View
                    key={day.key}
                    style={{
                      width: layout.dayWidth,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 4,
                      backgroundColor: day.isWeekend ? weekendTint : 'transparent',
                      borderLeftWidth: day.isMonthStart ? 1 : 0,
                      borderLeftColor: borderCol,
                    }}
                  >
                    {/* Weekday letter — only at wider zooms */}
                    {layout.dayWidth >= 26 && (
                      <Text style={{
                        fontSize: 9,
                        fontWeight: '500',
                        color: day.isToday ? todayCol : colors.text.tertiary,
                        marginBottom: 1,
                      }}>
                        {layout.dayWidth >= 42 ? day.weekDayShort : day.weekDay}
                      </Text>
                    )}

                    {/* Date number — today gets a filled circle badge */}
                    {day.isToday ? (
                      <View style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: todayCol,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: '#FFFFFF',
                          lineHeight: 13,
                        }}>
                          {day.day}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{
                        fontSize: 11,
                        fontWeight: day.isWeekend ? '400' : '500',
                        color: colors.text.secondary,
                      }}>
                        {day.day}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* ── Main chart body ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flexDirection: 'row', flex: 1 }}>

          {/* Fixed label column */}
          <View style={{
            width: layout.labelColumnWidth,
            backgroundColor: labelBg,
            borderRightWidth: 1,
            borderRightColor: borderCol,
          }}>
            {tasks.map((task, index) => {
              const statusColor = getStatusColor(task.status);
              const isLast = index === tasks.length - 1;
              const isDone = task.status === TimelineStatus.COMPLETED || task.status === TimelineStatus.DONE;

              return (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => onTaskPress?.(task)}
                  onLongPress={() => onTaskLongPress?.(task)}
                  delayLongPress={350}
                  activeOpacity={0.6}
                  style={{
                    height: layout.rowHeight,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: borderCol,
                    borderLeftWidth: 2,
                    borderLeftColor: statusColor,
                    justifyContent: 'center',
                    paddingHorizontal: labelsCollapsed ? 0 : spacing.sm,
                    alignItems: labelsCollapsed ? 'center' : 'flex-start',
                  }}
                >
                  {labelsCollapsed ? (
                    /* Collapsed: just a status dot */
                    <View style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: statusColor,
                    }} />
                  ) : (
                    /* Expanded: task name + status chip */
                    <>
                      <Text
                        style={{
                          fontSize: typography.size.xs,
                          fontWeight: typography.weight.medium,
                          color: isDone ? colors.text.tertiary : colors.text.primary,
                          textDecorationLine: isDone ? 'line-through' : 'none',
                          lineHeight: typography.size.xs * 1.35,
                          marginBottom: 3,
                        }}
                        numberOfLines={2}
                      >
                        {task.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {isDone
                          ? <CheckCircle2 size={10} color={statusColor} strokeWidth={2.5} />
                          : <Circle size={10} color={statusColor} strokeWidth={2.5} />
                        }
                        <Text style={{
                          fontSize: 9,
                          fontWeight: '600',
                          color: statusColor,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          {getStatusLabel(task.status)}
                        </Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Scrollable timeline */}
          <ScrollView
            ref={timelineScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            onScroll={handleTimelineScroll}
            scrollEventThrottle={8}
            snapToInterval={layout.dayWidth * 7}
            decelerationRate="fast"
          >
            <View style={{
              position: 'relative',
              minHeight: tasks.length * layout.rowHeight,
              minWidth: totalWidth,
            }}>

              {/* Alternating row tints */}
              {tasks.map((_, i) => (
                <View
                  key={`row-${i}`}
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: i * layout.rowHeight,
                    left: 0,
                    right: 0,
                    height: layout.rowHeight,
                    backgroundColor: i % 2 === 1
                      ? isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.012)'
                      : 'transparent',
                    borderBottomWidth: i < tasks.length - 1 ? 1 : 0,
                    borderBottomColor: borderCol,
                  }}
                />
              ))}

              {/* Weekly grid lines */}
              {Array.from({ length: Math.ceil(timelineRange.days / 7) }).map((_, w) => (
                <View
                  key={`wk-${w}`}
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: w * 7 * layout.dayWidth,
                    width: 1,
                    top: 0,
                    bottom: 0,
                    backgroundColor: borderCol,
                  }}
                />
              ))}

              {/* Today vertical line */}
              {todayOffset !== null && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: todayOffset - 0.75,
                    top: 0,
                    bottom: 0,
                    width: 1.5,
                    backgroundColor: todayCol,
                    opacity: 0.9,
                  }}
                />
              )}

              {/* Task bars */}
              {tasks.map((task, taskIndex) => {
                const position = getTaskPosition(task);
                const statusColor = getStatusColor(task.status);
                const progress = task.progressPercentage || 0;

                if (position.left + position.width < 0 || position.left > totalWidth) return null;

                // Milestone: diamond
                if (position.isMilestone) {
                  const d = 18;
                  return (
                    <AnimatedTaskBar
                      key={task.id}
                      index={taskIndex}
                      onPress={() => onTaskPress?.(task)}
                      onLongPress={() => onTaskLongPress?.(task)}
                      style={{
                        position: 'absolute',
                        top: taskIndex * layout.rowHeight + (layout.rowHeight - d) / 2,
                        left: position.left - d / 2,
                        width: d,
                        height: d,
                        transform: [{ rotate: '45deg' }],
                        backgroundColor: statusColor,
                        borderRadius: 3,
                      }}
                    >
                      <View style={{ flex: 1 }} />
                    </AnimatedTaskBar>
                  );
                }

                const showLabel = position.width > 52;

                return (
                  <AnimatedTaskBar
                    key={task.id}
                    index={taskIndex}
                    onPress={() => onTaskPress?.(task)}
                    onLongPress={() => onTaskLongPress?.(task)}
                    style={{
                      position: 'absolute',
                      top: taskIndex * layout.rowHeight + (layout.rowHeight - barHeight) / 2,
                      left: position.left,
                      width: position.width,
                      height: barHeight,
                      borderRadius: pillRadius,
                      overflow: 'hidden',
                      backgroundColor: isDark
                        ? `${statusColor}1A`
                        : `${statusColor}14`,
                    }}
                  >
                    {/* Solid left cap */}
                    <View style={{
                      position: 'absolute',
                      left: 0, top: 0, bottom: 0,
                      width: 4,
                      backgroundColor: statusColor,
                      borderTopLeftRadius: pillRadius,
                      borderBottomLeftRadius: pillRadius,
                    }} />

                    {/* Progress fill */}
                    {progress > 0 && (
                      <View style={{
                        position: 'absolute',
                        left: 4, top: 0, bottom: 0,
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: statusColor,
                        opacity: 0.22,
                      }} />
                    )}

                    {/* Label */}
                    {showLabel ? (
                      <Text
                        style={{
                          position: 'absolute',
                          left: 10,
                          right: spacing.xs,
                          top: 0,
                          bottom: 0,
                          fontSize: typography.size.xs - 1,
                          fontWeight: '600',
                          color: isDark ? colors.text.primary : colors.text.primary,
                          textAlignVertical: 'center',
                          lineHeight: barHeight,
                        }}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                    ) : (
                      <View style={{
                        position: 'absolute',
                        left: 9,
                        top: '50%',
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: statusColor,
                        marginTop: -2.5,
                      }} />
                    )}
                  </AnimatedTaskBar>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Jump to Today FAB */}
      {showFab && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            bottom: spacing.xl,
            right: spacing.xl,
            opacity: fabOpacity,
          }}
        >
          <TouchableOpacity
            onPress={handleJumpToToday}
            activeOpacity={0.85}
            style={{
              backgroundColor: todayCol,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              shadowColor: todayCol,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: typography.size.xs,
              fontWeight: '700',
              letterSpacing: 0.2,
            }}>
              Today
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
