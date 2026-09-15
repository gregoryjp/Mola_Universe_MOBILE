export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  capacityMembers: number;
}
export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'paused' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}
export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: string;
}
