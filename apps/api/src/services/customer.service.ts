import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { PAGINATION } from "@api/constants";
import * as polarService from "./polar.service";
import type { CustomerListParams, PolarCustomerResponse } from "@repo/types";

export async function createPolarCustomerForUser(
  userId: string,
  email: string,
  name?: string,
): Promise<{ externalCustomerId: string }> {
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      logger.info(
        { userId, externalCustomerId: existingCustomer.externalCustomerId },
        "Customer already exists for user",
      );
      return { externalCustomerId: existingCustomer.externalCustomerId };
    }

    const polarCustomer = await polarService.createPolarCustomer({
      email,
      name: name || undefined,
      external_id: userId,
      metadata: {
        userId,
      },
    });

    await prisma.customer.create({
      data: {
        externalCustomerId: polarCustomer.id,
        userId,
        email,
        name: name || null,
      },
    });

    logger.info(
      { userId, email, externalCustomerId: polarCustomer.id },
      "Polar customer created",
    );
    return { externalCustomerId: polarCustomer.id };
  } catch (error) {
    logger.error(
      { err: error, userId, email },
      "Error creating Polar customer",
    );
    throw new AppError(
      "POLAR_CUSTOMER_CREATE_ERROR",
      "Failed to create Polar customer",
      500,
    );
  }
}

export async function getUserPolarCustomerId(
  userId: string,
): Promise<string | null> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { externalCustomerId: true },
  });

  return customer?.externalCustomerId || null;
}

export async function getOrCreatePolarCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  const existingId = await getUserPolarCustomerId(userId);
  if (existingId) {
    return existingId;
  }

  const { externalCustomerId } = await createPolarCustomerForUser(
    userId,
    email,
    name,
  );
  return externalCustomerId;
}

export async function getCustomers(params: CustomerListParams) {
  const page =
    params.page && params.page > 0 ? params.page : PAGINATION.DEFAULT_PAGE;
  const limit =
    params.limit && params.limit > 0 ? params.limit : PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.search) {
    const search = params.search.toLowerCase();
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const customers = await Promise.all(
    items.map(async (item) => {
      let polar: PolarCustomerResponse | null = null;
      try {
        polar = await polarService.getPolarCustomerById(
          item.externalCustomerId,
        );
      } catch (error) {
        logger.warn(
          { err: error, externalCustomerId: item.externalCustomerId },
          "Failed to fetch Polar customer, falling back to local data",
        );
      }

      return {
        id: item.id,
        userId: item.userId,
        provider: item.provider,
        email: polar?.email ?? item.email,
        name: polar?.name ?? item.name ?? item.user?.name ?? null,
        externalCustomerId: item.externalCustomerId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    }),
  );

  return {
    customers,
    total,
    page,
    limit,
  };
}
