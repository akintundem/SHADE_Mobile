import { DATE_FORMATS } from './constants';

// Date utilities
export const dateUtils = {
  formatDate: (date: Date | string, format: string = DATE_FORMATS.DISPLAY_DATE): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return 'Invalid Date';

    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case DATE_FORMATS.DISPLAY_DATE:
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        break;
      case DATE_FORMATS.DISPLAY_TIME:
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
      case DATE_FORMATS.DISPLAY_DATETIME:
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }

    return d.toLocaleDateString('en-US', options);
  },

  isToday: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },
};
