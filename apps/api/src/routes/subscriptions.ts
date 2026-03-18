import { Elysia, t } from "elysia";
import { AppError } from "@api/lib/errors";
import {
  getSession,
  isAdmin,
  parsePagination,
  successResponse,
} from "@api/lib/route-helpers";
import * as subscriptionService from "@api/services/subscription.service";
import * as polarService from "@api/services/polar.service";

export const subscriptionsRoutes = new Elysia({ prefix: "/subscriptions" })
  .get(
    "/me",
    async ({ request: { headers }, query }) => {
      const session = await getSession(headers);
      const userIsAdmin = isAdmin(session.user.role);

      let subscriptions;
      if (userIsAdmin) {
        subscriptions = await subscriptionService.getAllSubscriptions();
      } else {
        subscriptions = await subscriptionService.getUserSubscriptions(
          session.user.id,
        );
      }

      const { page, limit, skip } = parsePagination(query);
      const total = subscriptions.length;
      const paginatedSubscriptions = subscriptions.slice(skip, skip + limit);

      return {
        success: true,
        data: paginatedSubscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Subscriptions"],
        summary: "Get subscriptions",
        description:
          "Returns paginated list of subscriptions. Admin/SuperAdmin sees all, regular users see only their own.",
      },
    },
  )

  .get(
    "/me/history",
    async ({ request: { headers }, query }) => {
      const session = await getSession(headers);
      const userIsAdmin = isAdmin(session.user.role);

      let subscriptions;
      if (userIsAdmin) {
        subscriptions = await subscriptionService.getAllSubscriptions();
      } else {
        subscriptions = await subscriptionService.getUserSubscriptions(
          session.user.id,
        );
      }

      const { page, limit, skip } = parsePagination(query);
      const paginatedSubscriptions = subscriptions.slice(skip, skip + limit);

      return successResponse(paginatedSubscriptions);
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Subscriptions"],
        summary: "Get subscription history",
        description: "Returns paginated subscription history",
      },
    },
  )

  .get(
    "/:id",
    async ({ params, request: { headers } }) => {
      const session = await getSession(headers);
      const userIsAdmin = isAdmin(session.user.role);

      const subscription = await subscriptionService.getSubscriptionById(
        params.id,
        session.user.id,
        userIsAdmin,
      );

      return successResponse(subscription);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Subscriptions"],
        summary: "Get subscription by ID",
      },
    },
  )

  .post(
    "/:id/cancel",
    async ({ params, body, request: { headers } }) => {
      const session = await getSession(headers);
      const userIsAdmin = isAdmin(session.user.role);

      const subscription = await subscriptionService.getSubscriptionById(
        params.id,
        session.user.id,
        userIsAdmin,
      );

      if (userIsAdmin && subscription.userId !== session.user.id) {
        throw new AppError(
          "FORBIDDEN",
          "You can only cancel your own subscriptions",
          403,
        );
      }

      const result = await subscriptionService.cancelSubscription(
        params.id,
        session.user.id,
        body?.immediate,
        userIsAdmin,
      );

      return {
        success: true,
        data: result,
        message: result.message,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Optional(
        t.Object({
          immediate: t.Optional(t.Boolean()),
        }),
      ),
      detail: {
        tags: ["Subscriptions"],
        summary: "Cancel subscription",
      },
    },
  )

  .post(
    "/:id/reactivate",
    async ({ params, request: { headers } }) => {
      const session = await getSession(headers);
      const userIsAdmin = isAdmin(session.user.role);

      const subscription = await subscriptionService.getSubscriptionById(
        params.id,
        session.user.id,
        userIsAdmin,
      );

      if (userIsAdmin && subscription.userId !== session.user.id) {
        throw new AppError(
          "FORBIDDEN",
          "You can only reactivate your own subscriptions",
          403,
        );
      }

      const result = await subscriptionService.reactivateSubscription(
        params.id,
        session.user.id,
        userIsAdmin,
      );

      return {
        success: true,
        data: result,
        message: result.message,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Subscriptions"],
        summary: "Reactivate subscription",
      },
    },
  )
  .post(
    "/checkout",
    async ({ body, request: { headers } }) => {
      const session = await getSession(headers);

      const checkout = await polarService.createCheckoutSession({
        priceId: body.priceId,
        successUrl: body.successUrl,
        userId: session.user.id,
        userEmail: session.user.email,
      });

      return successResponse(checkout);
    },
    {
      body: t.Object({
        priceId: t.String(),
        successUrl: t.String(),
      }),
      detail: {
        tags: ["Subscriptions"],
        summary: "Create checkout session",
        description: "Creates a Polar.sh checkout session for a specific price",
      },
    },
  )
  .get(
    "/portal",
    async ({ request: { headers } }) => {
      const session = await getSession(headers);

      const portal = await subscriptionService.getCustomerPortalUrl(
        session.user.id,
      );

      return successResponse(portal);
    },
    {
      detail: {
        tags: ["Subscriptions"],
        summary: "Get Customer Portal URL",
      },
    },
  );
