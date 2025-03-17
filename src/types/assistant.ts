/**
 * Valid assistant types in the system
 */
export const VALID_ASSISTANT_TYPES = ['general', 'code', 'data'] as const

/**
 * Type representing valid assistant types
 */
export type AssistantType = typeof VALID_ASSISTANT_TYPES[number]

/**
 * Type guard to check if a string is a valid assistant type
 */
export function isValidAssistantType(type: string): type is AssistantType {
  return VALID_ASSISTANT_TYPES.includes(type as AssistantType)
} 