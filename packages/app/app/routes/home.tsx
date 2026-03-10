import type { Route } from './+types/home';
import OrderBuilder from '~/order-builder';
import {
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_ADDONS,
  ADDON_PRICES,
} from '~/mock-data';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Order Builder' },
    { name: 'description', content: 'Order Builder' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  // const formData = await request.formData();
}

export async function loader({ context }: Route.LoaderArgs) {
  return {
    products: INITIAL_PRODUCTS,
    plans: INITIAL_PLANS,
    addOns: INITIAL_ADDONS,
    addOnPrices: ADDON_PRICES,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <OrderBuilder
      initialProducts={loaderData.products}
      initialPlans={loaderData.plans}
      initialAddOns={loaderData.addOns}
      addOnPrices={loaderData.addOnPrices}
    />
  );
}
