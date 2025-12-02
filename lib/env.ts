// Variables d'environnement pour la configuration
export const env = {
  // Google Analytics
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',

  // Google AdSense
  ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',

  // Email service (ex: SendGrid, Resend, etc.)
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'contact@mts-toolbox.com',
  EMAIL_TO: process.env.EMAIL_TO || 'contact@mts-toolbox.com',
}
