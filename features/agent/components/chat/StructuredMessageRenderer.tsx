import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { StructuredResponseDTO, VenueCardDTO, EmailCardDTO, ApprovalCardDTO, TaskCardDTO, BudgetCardDTO, TimelineCardDTO, ChipDTO, ActionButtonDTO } from '../../../../shared/types';
import VenueCard from './VenueCard';
import EmailCard from './EmailCard';
import ApprovalCard from './ApprovalCard';
import TaskCard from './TaskCard';
import BudgetCard from './BudgetCard';
import TimelineCard from './TimelineCard';

interface StructuredMessageRendererProps {
  structuredResponse: StructuredResponseDTO;
  onVenueSelect?: (venue: VenueCardDTO) => void;
  onEmailAction?: (email: EmailCardDTO, action: string) => void;
  onApprovalAction?: (approval: ApprovalCardDTO, action: string) => void;
  onTaskAction?: (task: TaskCardDTO, action: string) => void;
  onBudgetAction?: (budget: BudgetCardDTO, action: string) => void;
  onTimelineAction?: (timeline: TimelineCardDTO, action: string) => void;
  onChipPress?: (chip: ChipDTO) => void;
  onActionButtonPress?: (button: ActionButtonDTO) => void;
}

export default function StructuredMessageRenderer({
  structuredResponse,
  onVenueSelect,
  onEmailAction,
  onApprovalAction,
  onTaskAction,
  onBudgetAction,
  onTimelineAction,
  onChipPress,
  onActionButtonPress
}: StructuredMessageRendererProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const renderChips = (chips: ChipDTO[]) => {
    if (!chips || chips.length === 0) return null;

    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md
      }}>
        {chips.map((chip) => (
          <View
            key={chip.id}
            style={{
              backgroundColor: chip.selected ? colors.brand.primary : colors.surface,
              borderWidth: 1,
              borderColor: chip.selected ? colors.brand.primary : colors.border,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm
            }}
          >
            <Text style={{
              color: chip.selected ? colors.text.inverse : colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium
            }}>
              {chip.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButtons = (buttons: ActionButtonDTO[]) => {
    if (!buttons || buttons.length === 0) return null;

    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md
      }}>
        {buttons.map((button) => (
          <View
            key={button.id}
            style={{
              backgroundColor: button.style === 'primary' ? colors.brand.primary : colors.surface,
              borderWidth: 1,
              borderColor: button.style === 'primary' ? colors.brand.primary : colors.border,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              opacity: button.disabled ? 0.5 : 1
            }}
          >
            <Text style={{
              color: button.style === 'primary' ? colors.text.inverse : colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              {button.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderVenueCards = (venues: VenueCardDTO[]) => {
    if (!venues || venues.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onSelect={() => onVenueSelect?.(venue)}
          />
        ))}
      </View>
    );
  };

  const renderEmailCards = (emails: EmailCardDTO[]) => {
    if (!emails || emails.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            onSend={() => onEmailAction?.(email, 'send')}
            onEdit={() => onEmailAction?.(email, 'edit')}
            onView={() => onEmailAction?.(email, 'view')}
            onSchedule={() => onEmailAction?.(email, 'schedule')}
          />
        ))}
      </View>
    );
  };

  const renderApprovalCards = (approvals: ApprovalCardDTO[]) => {
    if (!approvals || approvals.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            onApprove={() => onApprovalAction?.(approval, 'approve')}
            onReject={() => onApprovalAction?.(approval, 'reject')}
            onViewDetails={() => onApprovalAction?.(approval, 'view')}
          />
        ))}
      </View>
    );
  };

  const renderTaskCards = (tasks: TaskCardDTO[]) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={() => onTaskAction?.(task, 'complete')}
            onStart={() => onTaskAction?.(task, 'start')}
            onPause={() => onTaskAction?.(task, 'pause')}
            onViewDetails={() => onTaskAction?.(task, 'view')}
          />
        ))}
      </View>
    );
  };

  const renderBudgetCards = (budgets: BudgetCardDTO[]) => {
    if (!budgets || budgets.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onApprove={() => onBudgetAction?.(budget, 'approve')}
            onReject={() => onBudgetAction?.(budget, 'reject')}
            onViewDetails={() => onBudgetAction?.(budget, 'view')}
          />
        ))}
      </View>
    );
  };

  const renderTimelineCards = (timelines: TimelineCardDTO[]) => {
    if (!timelines || timelines.length === 0) return null;

    return (
      <View style={{ marginTop: spacing.md }}>
        {timelines.map((timeline) => (
          <TimelineCard
            key={timeline.id}
            timeline={timeline}
            onStart={() => onTimelineAction?.(timeline, 'start')}
            onComplete={() => onTimelineAction?.(timeline, 'complete')}
            onViewDetails={() => onTimelineAction?.(timeline, 'view')}
          />
        ))}
      </View>
    );
  };

  return (
    <View>
      {/* Text Content */}
      {structuredResponse.text && (
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size.base,
          lineHeight: typography.lineHeight.normal * typography.size.base,
          marginBottom: spacing.sm
        }}>
          {structuredResponse.text}
        </Text>
      )}

      {/* Venue Cards */}
      {structuredResponse.venueCards && renderVenueCards(structuredResponse.venueCards)}

      {/* Email Cards */}
      {structuredResponse.emailCards && renderEmailCards(structuredResponse.emailCards)}

      {/* Approval Cards */}
      {structuredResponse.approvalCards && renderApprovalCards(structuredResponse.approvalCards)}

      {/* Task Cards */}
      {structuredResponse.taskCards && renderTaskCards(structuredResponse.taskCards)}

      {/* Budget Cards */}
      {structuredResponse.budgetCards && renderBudgetCards(structuredResponse.budgetCards)}

      {/* Timeline Cards */}
      {structuredResponse.timelineCards && renderTimelineCards(structuredResponse.timelineCards)}

      {/* Chips */}
      {structuredResponse.chips && renderChips(structuredResponse.chips)}

      {/* Action Buttons */}
      {structuredResponse.actionButtons && renderActionButtons(structuredResponse.actionButtons)}
    </View>
  );
}
