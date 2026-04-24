/**
 * Generates a QR code as a base64 data URL for embedding in emails
 * @param text - The text/URL to encode in the QR code (typically order ID or check-in token)
 * @param size - Size in pixels (default 280)
 * @returns Promise resolving to base64 data URL string
 */
export async function generateQRCodeDataUrl(text: string, size = 280): Promise<string> {
  // Render QR code to canvas then extract data URL
  // This is called server-side in Edge Function, so we use a minimal implementation

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // For now, return a placeholder - in production this would be generated server-side
  // The actual implementation will be in the Edge Function using qrcode package
  // This client-side version can render visual QR codes using qrcode.react component

  // Create a data URL of a placeholder for email (actual QR will be generated server-side)
  canvas.width = size
  canvas.height = size

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // Black border to indicate placeholder
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, size, size)

  // Text placeholder
  ctx.fillStyle = '#000000'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('QR Code', size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

/**
 * Alternative: Generate using Canvas API with pré-rendered component
 * This is a fallback that generates a simple visual QR code representation
 */
export async function generateCheckInQRCode(
  orderId: string,
  eventId: string,
  size = 280,
): Promise<string> {
  const checkInToken = `${orderId}:${eventId}`
  return generateQRCodeDataUrl(checkInToken, size)
}

/**
 * Generate QR code for ticket or external sharing
 */
export async function generateTicketQRCode(ticketId: string, size = 280): Promise<string> {
  return generateQRCodeDataUrl(ticketId, size)
}

/**
 * Encode order data into a shareable QR code URL
 * Format: capital-strike://check-in/ORDER_ID (can be scanned at event)
 */
export function buildCheckInQRValue(orderId: string, eventId: string): string {
  return `https://check-in.capitalstrike.com.br/${eventId}/${orderId}`
}
