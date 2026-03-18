import { Elysia, t } from "elysia";
import { AppError } from "@api/lib/errors";
import {
  requireAdmin,
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import * as orderService from "@api/services/order.service";

export const ordersRoutes = new Elysia({ prefix: "/orders" })
  .get(
    "/",
    async ({ request: { headers }, query }) => {
      await requireAdmin(headers);

      const { page, limit } = parsePagination(query);
      const result = await orderService.getAllOrders({ page, limit });

      return paginatedResponse(
        result.orders,
        result.total,
        result.page,
        result.limit,
      );
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Get all orders",
        description: "Returns list of all orders. Admin/SuperAdmin only.",
      },
    },
  )

  .get(
    "/:id",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);

      // Try to get from database first, if not found, fetch from Polar
      let order = await orderService.getOrderById(params.id);

      if (!order) {
        order = await orderService.getOrderByPolarId(params.id);
      }

      if (!order) {
        order = await orderService.getOrderByIdFromPolar(params.id);
      }

      if (!order) {
        throw new AppError("ORDER_NOT_FOUND", "Order not found", 404);
      }

      return successResponse(order);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Get order by ID",
        description: "Returns a single order. Admin/SuperAdmin only.",
      },
    },
  )

  .get(
    "/:id/invoice",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);

      const invoice = await orderService.getOrderInvoice(params.id);

      return successResponse(invoice);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Get order invoice",
        description:
          "Returns invoice information for an order. Admin/SuperAdmin only.",
      },
    },
  );
