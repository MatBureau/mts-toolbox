// Configuration Google AdSense
export const ADSENSE_CLIENT_ID = 'ca-pub-3985065672152959'

// Slots AdSense
export const AD_SLOTS = {
  // Format auto - usage général
  AUTO: '5441593935',

  // Format horizontal - header, entre sections
  HORIZONTAL: '7387749353',

  // Format vertical - sidebar
  VERTICAL: '4889578524',
} as const

export type AdSlotType = keyof typeof AD_SLOTS
