import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Plan, Subscription, CheckoutSession } from '../interface/types';

const BILLING_KEY = 'billing';

async function fetchPlans(): Promise<Plan[]> {
  const res = await apiClient.get<{ plans: Plan[] }>('/billing/plans');
  return res.data.plans;
}

async function fetchSubscription(): Promise<Subscription | null> {
  try {
    const res = await apiClient.get<{ subscription: Subscription }>('/billing/subscription');
    return res.data.subscription;
  } catch {
    return null;
  }
}

async function createCheckout(planId: string): Promise<string> {
  const res = await apiClient.post<{ session: CheckoutSession }>('/billing/checkout', { planId });
  return res.data.session.url;
}

async function cancelSubscription(): Promise<Subscription> {
  const res = await apiClient.post<{ subscription: Subscription }>('/billing/subscription/cancel', {});
  return res.data.subscription;
}

export function useBilling() {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: [BILLING_KEY, 'plans'],
    queryFn: fetchPlans,
  });

  const subscriptionQuery = useQuery({
    queryKey: [BILLING_KEY, 'subscription'],
    queryFn: fetchSubscription,
  });

  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_KEY, 'subscription'] });
    },
  });

  return {
    plans: plansQuery.data || [],
    isLoadingPlans: plansQuery.isLoading,
    subscription: subscriptionQuery.data,
    isLoadingSubscription: subscriptionQuery.isLoading,
    checkout: checkoutMutation,
    cancel: cancelMutation,
  };
}
