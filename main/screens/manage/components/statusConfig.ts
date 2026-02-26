import { CheckCircle2, Clock, HelpCircle, Ticket, XCircle } from 'lucide-react-native';

export const STATUS_CONFIG: Record<string, { label: string; textClass: string; bgClass: string }> = {
  DRAFT:               { label: 'Draft',     textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface-soft dark:bg-dark-surface-strong' },
  PLANNING:            { label: 'Planning',  textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface-soft dark:bg-dark-surface-strong' },
  PUBLISHED:           { label: 'Published', textClass: 'text-semantic-success',                         bgClass: 'bg-semantic-success/10' },
  REGISTRATION_OPEN:   { label: 'Open',      textClass: 'text-semantic-success',                         bgClass: 'bg-semantic-success/10' },
  REGISTRATION_CLOSED: { label: 'Closed',    textClass: 'text-semantic-warning',                         bgClass: 'bg-semantic-warning/10' },
  IN_PROGRESS:         { label: 'Live',      textClass: 'text-semantic-error',                           bgClass: 'bg-semantic-error/10' },
  COMPLETED:           { label: 'Done',      textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface-soft dark:bg-dark-surface-strong' },
  CANCELLED:           { label: 'Cancelled', textClass: 'text-semantic-error',                           bgClass: 'bg-semantic-error/10' },
  POSTPONED:           { label: 'Postponed', textClass: 'text-semantic-warning',                         bgClass: 'bg-semantic-warning/10' },
};

export const STATUS_DOT: Record<string, string> = {
  IN_PROGRESS:         '#ef4444',
  PUBLISHED:           '#22c55e',
  REGISTRATION_OPEN:   '#22c55e',
  REGISTRATION_CLOSED: '#f59e0b',
  COMPLETED:           '#6b7280',
  CANCELLED:           '#ef4444',
  POSTPONED:           '#f59e0b',
  DRAFT:               '#6b7280',
  PLANNING:            '#6b7280',
};

export type AttendanceInfo = {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
};

type SemanticColors = {
  success: string;
  warning: string;
  error: string;
  info: string;
};

type UserContext = {
  hasValidTicket?: boolean | null;
  ticketStatus?: string | null;
  rsvpStatus?: string | null;
  hasInvite?: boolean | null;
  inviteStatus?: string | null;
};

export function resolveAttendance(uc: UserContext, semantic: SemanticColors): AttendanceInfo | null {
  const { hasValidTicket, ticketStatus, rsvpStatus, hasInvite, inviteStatus } = uc;

  if (hasValidTicket || ticketStatus === 'ISSUED' || ticketStatus === 'VALIDATED') {
    return { icon: Ticket, label: 'Ticket issued', color: semantic.success, bgClass: 'bg-semantic-success/10', textClass: 'text-semantic-success' };
  }
  if (ticketStatus === 'PENDING') {
    return { icon: Clock, label: 'Ticket pending', color: semantic.warning, bgClass: 'bg-semantic-warning/10', textClass: 'text-semantic-warning' };
  }
  if (rsvpStatus === 'CONFIRMED') {
    return { icon: CheckCircle2, label: 'Going', color: semantic.success, bgClass: 'bg-semantic-success/10', textClass: 'text-semantic-success' };
  }
  if (rsvpStatus === 'TENTATIVE') {
    return { icon: HelpCircle, label: 'Maybe going', color: semantic.warning, bgClass: 'bg-semantic-warning/10', textClass: 'text-semantic-warning' };
  }
  if (rsvpStatus === 'DECLINED') {
    return { icon: XCircle, label: 'Declined', color: semantic.error, bgClass: 'bg-semantic-error/10', textClass: 'text-semantic-error' };
  }
  if (hasInvite && inviteStatus === 'ACCEPTED') {
    return { icon: CheckCircle2, label: 'Invite accepted', color: semantic.success, bgClass: 'bg-semantic-success/10', textClass: 'text-semantic-success' };
  }
  if (hasInvite) {
    return { icon: Clock, label: 'Invite pending', color: semantic.info, bgClass: 'bg-semantic-info/10', textClass: 'text-semantic-info' };
  }
  return null;
}
