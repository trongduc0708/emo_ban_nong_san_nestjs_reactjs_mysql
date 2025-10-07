/**
 * Utility functions for handling price calculations and formatting
 */

/**
 * Convert Prisma Decimal to number
 * @param value - The value to convert (can be Decimal, string, number, or null/undefined)
 * @returns number - The converted number
 */
export function convertDecimalToNumber(value: any): number {
  if (!value) return 0
  
  // If it's already a number, return it
  if (typeof value === 'number') return value
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  
  // If it's a Prisma Decimal object with s, e, d structure
  if (typeof value === 'object' && value.s !== undefined && value.e !== undefined && value.d) {
    // Prisma Decimal format: { s: 1, e: 4, d: [15000] }
    // s = sign (1 for positive, -1 for negative)
    // e = exponent (number of digits after decimal point)
    // d = digits array
    const sign = value.s === 1 ? 1 : -1
    const exponent = value.e
    const digits = value.d
    
    if (Array.isArray(digits) && digits.length > 0) {
      // Convert digits array to number
      // For { s: 1, e: 4, d: [15000] }, the value is 15000 / 10^4 = 1.5
      // But we want 15000, so we need to multiply by 10^4
      let result = 0
      for (let i = 0; i < digits.length; i++) {
        result += digits[i] * Math.pow(10, digits.length - 1 - i)
      }
      return sign * result
    }
  }
  
  // If it's a Decimal object with toNumber method
  if (typeof value === 'object' && value.toNumber) {
    return value.toNumber()
  }
  
  // If it's a Decimal object with toString method
  if (typeof value === 'object' && value.toString) {
    const str = value.toString()
    const parsed = parseFloat(str)
    return isNaN(parsed) ? 0 : parsed
  }
  
  // Try to convert to number
  const converted = Number(value)
  return isNaN(converted) ? 0 : converted
}

/**
 * Format price for display
 * @param value - The price value to format
 * @returns string - Formatted price string
 */
export function formatPrice(value: any): string {
  const numValue = convertDecimalToNumber(value)
  return numValue.toLocaleString('vi-VN')
}

/**
 * Calculate total price for cart items
 * @param items - Array of cart items
 * @returns number - Total price
 */
export function calculateTotalPrice(items: any[]): number {
  return items.reduce((sum, item) => {
    const unitPrice = convertDecimalToNumber(item.unitPriceSnapshot)
    return sum + (unitPrice * item.quantity)
  }, 0)
}
