// import { database } from '~/database/context';
// import * as schema from '~/database/schema';

import type { Route } from './+types/home';
import OrderBuilder from '~/order-builder';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Order Builder' },
    { name: 'description', content: 'Order Builder' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  // const formData = await request.formData();
}

export async function loader({ context }: Route.LoaderArgs) {}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return <OrderBuilder />;
}
