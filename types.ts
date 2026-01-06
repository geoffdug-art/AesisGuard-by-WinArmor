
export interface WindowsTool {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'System' | 'Network' | 'Defender' | 'Registry';
  hiddenLevel: 'Low' | 'Medium' | 'High';
}

export interface Threat {
  name: string;
  type: 'Malware' | 'Trojan' | 'Spyware' | 'Ransomware';
  severity: 'Critical' | 'High' | 'Medium';
  lastSeen: string;
  description: string;
}

export interface BlacklistedDomain {
  id: string;
  domain: string;
  reason: string;
  dateAdded: string;
}

export enum ScanStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  CLEANING = 'CLEANING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type SubscriptionTier = 'LIFETIME' | '1YEAR' | '6MONTHS' | '1MONTH' | '1DAY' | null;

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  expiryDate: string | null;
  isActive: boolean;
}
