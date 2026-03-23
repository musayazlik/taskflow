export type UserQuery = {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
};

export type UpdateUserBody = Partial<{
  name: string;
  email: string;
  image: string;
}>;

export type BulkIdsBody = {
  ids: string[];
};

export type CreateUserBody = {
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  password: string;
};
