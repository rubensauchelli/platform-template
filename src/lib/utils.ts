import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a properly formatted CSV
 * Can be used in both frontend and backend
 */
export function isValidCsv(content: string): boolean {
  if (!content || typeof content !== 'string') {
    console.error('❌ CSV validation failed: Content is empty or not a string');
    return false;
  }

  try {
    // Split into lines
    const lines = content.trim().split(/\r?\n/);
    
    if (lines.length < 2) {
      console.error('❌ CSV validation failed: Need at least header + one data row');
      return false;
    }

    // Check header format
    const expectedHeader = 'Field,Value,Additional Information';
    if (lines[0].trim() !== expectedHeader) {
      console.error('❌ CSV validation failed: Invalid header format', {
        expected: expectedHeader,
        received: lines[0]
      });
      return false;
    }

    // Check if all lines have the same number of columns
    const columnCount = lines[0].split(',').length;
    
    const isValid = lines.every((line, index) => {
      // Add trailing commas to ensure empty fields are counted
      const paddedLine = line + ','.repeat(Math.max(0, columnCount - (line.split(',').length)));
      const columns = paddedLine.split(',').slice(0, columnCount);
      const isLineValid = columns.length === columnCount;
      
      if (!isLineValid) {
        console.error(`❌ CSV validation failed: Invalid column count at line ${index + 1}`, {
          line,
          expectedColumns: columnCount,
          actualColumns: columns.length
        });
      }
      
      return isLineValid;
    });

    return isValid;
  } catch (error) {
    console.error('❌ CSV validation error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
