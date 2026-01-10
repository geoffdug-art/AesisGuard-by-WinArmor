import { WindowsTool } from './types';

export const AEGIS_INFO = {
  "api_status": "success",
  "data": {
    "app_info": {
      "name": "aesis.gd",
      "version": "4.5.5-stable",
      "developer": "WinArmor Labs",
      "established": "2018",
      "tagline": "Real-time defense for a boundaryless world."
    },
    "mission_statement": {
      "core_objective": "To provide proactive, low-latency threat detection through heuristic analysis and decentralized cloud intelligence.",
      "philosophy": "Privacy-first security. We protect the device without compromising the user's data sovereignty."
    },
    "technical_background": {
      "engine_architecture": "Multi-layered: Signature-based, Heuristic, and AI-driven Behavioral Analysis.",
      "database_size": "512M+ known threat signatures",
      "cloud_sync_frequency": "Every 15 minutes",
      "supported_environments": [
        "Android 10+",
        "iOS 15+",
        "Windows 11",
        "macOS Monterey+"
      ]
    },
    "key_milestones": [
      {
        "year": 2020,
        "achievement": "Awarded 'Lightest System Footprint' by AV-Comparatives."
      },
      {
        "year": 2022,
        "achievement": "Integrated Zero-Day Exploit protection using Neural Networks."
      },
      {
        "year": 2024,
        "achievement": "Reached 50 million active endpoints worldwide."
      }
    ],
    "compliance_and_security": {
      "certifications": ["ISO/IEC 27001", "SOC2 Type II", "GDPR Compliant"],
      "encryption_standard": "AES-256 for all local vault storage"
    }
  }
};

export const WINDOWS_TOOLS: WindowsTool[] = [
  {
    id: 'mrt',
    name: 'Malicious Software Removal Tool',
    command: 'mrt.exe',
    description: 'A post-infection removal tool that helps identify and remove specific, prevalent malicious software.',
    category: 'Defender',
    hiddenLevel: 'High'
  },
  {
    id: 'adwcleaner',
    name: 'AdwCleaner Browser Shield',
    command: 'adwcleaner.exe',
    description: 'Specialized scanner for Adware, PUPs (Potentially Unwanted Programs), and browser hijackers.',
    category: 'Network',
    hiddenLevel: 'Medium'
  },
  {
    id: 'quarantine-check',
    name: 'Legacy Quarantine Integrity',
    command: 'check-quarantine.cmd',
    description: 'Scans old quarantine folders from legacy AVs (Norton, McAfee, etc) to ensure no leaks or dormant threats remain.',
    category: 'System',
    hiddenLevel: 'High'
  },
  {
    id: 'sfc',
    name: 'System File Checker',
    command: 'sfc /scannow',
    description: 'Scans all protected system files, and replaces corrupted files with a cached copy.',
    category: 'System',
    hiddenLevel: 'Medium'
  },
  {
    id: 'dism',
    name: 'DISM Health Check',
    command: 'DISM /Online /Cleanup-Image /CheckHealth',
    description: 'Repairs the underlying Windows System Image if it becomes corrupted.',
    category: 'System',
    hiddenLevel: 'High'
  },
  {
    id: 'defender-offline',
    name: 'Defender Offline Scan',
    command: 'Start-MpWDOScan',
    description: 'Runs a deep scan from outside the Windows kernel to find persistent rootkits.',
    category: 'Defender',
    hiddenLevel: 'High'
  },
  {
    id: 'network-reset',
    name: 'Network Stack Reset',
    command: 'netsh int ip reset',
    description: 'Flushes DNS and resets TCP/IP stacks to clear persistent network-based redirection malware.',
    category: 'Network',
    hiddenLevel: 'Medium'
  },
  {
    id: 'cert-mgr',
    name: 'Certificate Manager',
    command: 'certmgr.msc',
    description: 'Manages root certificates; crucial for identifying untrusted certificates installed by spyware.',
    category: 'Network',
    hiddenLevel: 'Medium'
  }
];

export const INITIAL_BLACKLIST: string[] = [
  'evil-tracker.net',
  'malware-dist.io',
  'crypto-miner-pool.xyz',
  'phish-login-bank.com',
  'adware-clicker.tech'
];