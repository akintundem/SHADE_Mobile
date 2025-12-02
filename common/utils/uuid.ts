import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4 compatible string
 * Uses the standard uuid library for reliable UUID generation
 */
export function generateUUID(): string {
  return uuidv4();
}

