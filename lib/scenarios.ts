import { ScenarioPreset } from './types';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'burst-pipe-2am',
    title: 'Burst Water Pipe at 2:00 AM',
    trade: 'plumbing',
    address: '420 Market St, Apt 4B, San Francisco, CA',
    description: 'Main supply pipe in master bathroom burst. Water flooding hardwood floors into the apartment below. Urgent shutoff and emergency repair required immediately.',
    maxEtaMinutes: 90,
    maxBudget: 350,
    severity: 'critical',
    icon: 'Droplets'
  },
  {
    id: 'walkin-freezer-down',
    title: 'Restaurant Walk-in Freezer Down',
    trade: 'hvac',
    address: '180 Commercial Way, Ocean Grill, San Francisco, CA',
    description: 'Walk-in refrigeration compressor tripped offline. Over $18,000 worth of fresh seafood and prime beef at risk of thawing within 2 hours. Need commercial refrigeration specialist.',
    maxEtaMinutes: 60,
    maxBudget: 450,
    severity: 'critical',
    icon: 'Snowflake'
  },
  {
    id: 'broken-store-lock',
    title: 'Storefront Entrance Lock Smashed',
    trade: 'locksmith',
    address: '742 Evergreen Blvd, Downtown Retail, San Francisco, CA',
    description: 'Glass entry door mortise cylinder vandalized and jammed open at 11:30 PM. Store cannot be secured overnight. Urgent commercial cylinder replacement required.',
    maxEtaMinutes: 45,
    maxBudget: 280,
    severity: 'high',
    icon: 'Lock'
  },
  {
    id: 'sparking-panel-power-loss',
    title: 'Sparking Electrical Panel & Arc Flash',
    trade: 'electrical',
    address: '901 Mission St, Unit 302, San Francisco, CA',
    description: '200A main subpanel sparking with burning plastic odor. Breaker won\'t reset. Half of residential building branch circuits offline. Urgent licensed electrician required.',
    maxEtaMinutes: 75,
    maxBudget: 400,
    severity: 'critical',
    icon: 'Zap'
  }
];
