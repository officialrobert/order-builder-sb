import { ADDON_PRICES } from '~/mock-data';
import type { Route } from './+types/api.calculate-price';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { planPrice, addonIds, contractPeriod, billingCycle } =
      await request.json();

    const totalPlanPrice = Number(planPrice) || 0;
    const totalAddOnsPrice = (addonIds as string[]).reduce(
      (sum, id) => sum + (ADDON_PRICES[id] || 0),
      0,
    );

    const monthlyCost =
      billingCycle === 'annual'
        ? totalPlanPrice / 12 + totalAddOnsPrice
        : totalPlanPrice + totalAddOnsPrice;

    const totalAmount = monthlyCost * (contractPeriod || 1);

    return new Response(
      JSON.stringify({
        monthlyCost: monthlyCost.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        tax: '0.00',
        currency: 'USD',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
