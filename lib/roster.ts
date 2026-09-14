import { Contractor, TradeType } from './types';

export const CONTRACTOR_ROSTER: Contractor[] = [
  // Plumbing
  {
    id: 'plumb-01',
    name: 'Apex 24/7 Rapid Plumbers',
    trade: 'plumbing',
    phone: process.env.TEST_CONTRACTOR_PHONE || '+1 (415) 555-0192',
    rating: 4.8,
    avgResponseMins: 30,
    baseCalloutFee: 180,
    city: 'San Francisco, CA'
  },
  {
    id: 'plumb-02',
    name: 'Bay Area Emergency Rooter',
    trade: 'plumbing',
    phone: '+1 (415) 555-0199',
    rating: 4.6,
    avgResponseMins: 45,
    baseCalloutFee: 240,
    city: 'San Francisco, CA'
  },
  {
    id: 'plumb-03',
    name: 'Golden Gate Pipe & Drain Co.',
    trade: 'plumbing',
    phone: '+1 (415) 555-0176',
    rating: 4.9,
    avgResponseMins: 50,
    baseCalloutFee: 210,
    city: 'San Francisco, CA'
  },
  {
    id: 'plumb-04',
    name: 'Mission Express Plumbing',
    trade: 'plumbing',
    phone: '+1 (415) 555-0211',
    rating: 4.5,
    avgResponseMins: 60,
    baseCalloutFee: 195,
    city: 'San Francisco, CA'
  },

  // HVAC
  {
    id: 'hvac-01',
    name: 'Pacific Climate & Refrigeration',
    trade: 'hvac',
    phone: '+1 (415) 555-0321',
    rating: 4.9,
    avgResponseMins: 40,
    baseCalloutFee: 250,
    city: 'San Francisco, CA'
  },
  {
    id: 'hvac-02',
    name: 'Arctic Blast Commercial Coolers',
    trade: 'hvac',
    phone: '+1 (415) 555-0388',
    rating: 4.7,
    avgResponseMins: 55,
    baseCalloutFee: 280,
    city: 'San Francisco, CA'
  },
  {
    id: 'hvac-03',
    name: 'Valley Heating & Air Direct',
    trade: 'hvac',
    phone: '+1 (415) 555-0355',
    rating: 4.6,
    avgResponseMins: 75,
    baseCalloutFee: 220,
    city: 'San Francisco, CA'
  },

  // Locksmith
  {
    id: 'lock-01',
    name: 'KeyMaster 24/7 Security Locksmiths',
    trade: 'locksmith',
    phone: '+1 (415) 555-0404',
    rating: 4.9,
    avgResponseMins: 25,
    baseCalloutFee: 150,
    city: 'San Francisco, CA'
  },
  {
    id: 'lock-02',
    name: 'SafeGuard Commercial Entry & Locks',
    trade: 'locksmith',
    phone: '+1 (415) 555-0450',
    rating: 4.7,
    avgResponseMins: 35,
    baseCalloutFee: 180,
    city: 'San Francisco, CA'
  },
  {
    id: 'lock-03',
    name: 'Downtown QuickKey Mobile',
    trade: 'locksmith',
    phone: '+1 (415) 555-0499',
    rating: 4.4,
    avgResponseMins: 45,
    baseCalloutFee: 160,
    city: 'San Francisco, CA'
  },

  // Electrical
  {
    id: 'elec-01',
    name: 'VoltShield Emergency Electricians',
    trade: 'electrical',
    phone: '+1 (415) 555-0512',
    rating: 4.9,
    avgResponseMins: 35,
    baseCalloutFee: 225,
    city: 'San Francisco, CA'
  },
  {
    id: 'elec-02',
    name: 'HighPower Industrial & Home Electric',
    trade: 'electrical',
    phone: '+1 (415) 555-0567',
    rating: 4.7,
    avgResponseMins: 50,
    baseCalloutFee: 260,
    city: 'San Francisco, CA'
  },
  {
    id: 'elec-03',
    name: 'All-Night Sparks Circuit Pro',
    trade: 'electrical',
    phone: '+1 (415) 555-0599',
    rating: 4.5,
    avgResponseMins: 65,
    baseCalloutFee: 210,
    city: 'San Francisco, CA'
  }
];

export function getContractorsForTrade(trade: TradeType): Contractor[] {
  return CONTRACTOR_ROSTER.filter(c => c.trade === trade);
}
