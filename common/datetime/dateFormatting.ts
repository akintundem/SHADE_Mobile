import { DATE_FORMATS } from '../utils/constants';
import { dateUtils } from '../utils/helpers';

export type TimeParts = { hour: number; minute: number };

const TIME_24H_REGEX = /^(\d{1,2}):(\d{2})$/;
const TIME_12H_REGEX = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

const sanitizeDateString = (value: string) => value.replace(/\s+/g, '');

export const parseDateInput = (value?: string): Date | null => {
  if (!value) return null;
  const sanitized = sanitizeDateString(value);
  const match = sanitized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const parseTimeInput = (value?: string): TimeParts | null => {
  if (!value) return null;
  const trimmed = value.trim();

  let match = trimmed.match(TIME_24H_REGEX);
  if (match) {
    const [, hourStr, minuteStr] = match;
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (hour <= 23 && minute <= 59) {
      return { hour, minute };
    }
  }

  match = trimmed.match(TIME_12H_REGEX);
  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    if (hour <= 23 && minute <= 59) {
      return { hour, minute };
    }
  }

  return null;
};

export const toIsoDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toTimeString = (time: TimeParts): string => {
  const hour = time.hour.toString().padStart(2, '0');
  const minute = time.minute.toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

const formatDisplayTimeFromParts = (time: TimeParts): string => {
  const minute = time.minute.toString().padStart(2, '0');
  const hour12Raw = time.hour % 12 || 12;
  const hour12 = hour12Raw.toString();
  const period = time.hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute} ${period}`;
};

export const formatDisplayDateTime = (dateStr?: string, timeStr?: string): string | null => {
  const date = parseDateInput(dateStr);
  const time = parseTimeInput(timeStr);

  if (date && time) {
    const combined = new Date(date);
    combined.setHours(time.hour, time.minute, 0, 0);
    return dateUtils.formatDate(combined, DATE_FORMATS.DISPLAY_DATETIME);
  }

  if (date) {
    return dateUtils.formatDate(date, DATE_FORMATS.DISPLAY_DATE);
  }

  if (time) {
    return formatDisplayTimeFromParts(time);
  }

  return null;
};

export const formatDisplayTime = (timeStr?: string): string | null => {
  const time = parseTimeInput(timeStr);
  if (!time) return timeStr || null;
  return formatDisplayTimeFromParts(time);
};
