import { Elysia, t } from "elysia";
import {
  requireAdmin,
  parsePagination,
  paginatedResponse,
} from "@api/lib/route-helpers";
import { CustomerSchema, CustomerQuerySchema } from "@repo/types";
import * as customerService from "@api/services/customer.service";

export const customersRoutes = new Elysia({ prefix: "/customers" })
  .get(
    "/",
    async ({ request: { headers }, query }) => {
      await requireAdmin(headers);

      const { page, limit } = parsePagination(query);

      const { customers, total } = await customerService.getCustomers({
        page,
        limit,
        search: query.search,
      });

      return paginatedResponse(customers, total, page, limit);
    },
    {
      query: CustomerQuerySchema,
      detail: {
        tags: ["Payments"],
        summary: "List customers",
        description:
          "Returns paginated list of customers that are linked to Polar.sh customers.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Array(CustomerSchema),
        meta: t.Object({
          total: t.Number(),
          page: t.Number(),
          limit: t.Number(),
          totalPages: t.Number(),
        }),
      }),
    },
  )
  .post(
    "/import-from-polar",
    async ({ request: { headers } }) => {
      await requireAdmin(headers);
      const polarService = await import("@api/services/polar.service");
      const result = await polarService.importPolarCustomers();

      return {
        success: true,
        data: result,
        message: `${result.imported} customers imported, ${result.updated} updated, ${result.skipped} skipped`,
      };
    },
    {
      detail: {
        tags: ["Payments"],
        summary: "Import customers from Polar",
        description: "Imports customers from Polar.sh to local database",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          imported: t.Number(),
          updated: t.Number(),
          skipped: t.Number(),
          customers: t.Array(
            t.Object({
              id: t.String(),
              name: t.Nullable(t.String()),
              externalCustomerId: t.String(),
            }),
          ),
        }),
        message: t.String(),
      }),
    },
  );
