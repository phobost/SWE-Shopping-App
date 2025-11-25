import { Orders } from "@/components/order";
import { getAllUserOrders } from "@/helpers/orders/util";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/orders")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/" });
    }

    return {
      orders: await getAllUserOrders(context.auth.user),
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orders, auth } = Route.useRouteContext();

  return <Orders orders={orders} isAdmin={auth.isAdmin()} />;
}
