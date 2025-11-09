/**
 * Utility functions for exporting data to CSV/Excel
 */

export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from data if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Convert data to CSV format
  const csvContent = [
    // Headers
    csvHeaders.join(','),
    // Data rows
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header] ?? ''
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel UTF-8 support
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const formatCurrencyForExport = (amount: number) => {
  return amount.toLocaleString('vi-VN')
}

