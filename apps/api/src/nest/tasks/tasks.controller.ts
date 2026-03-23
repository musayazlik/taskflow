import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AppError } from "@api/lib/errors";
import {
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";
import { TasksService } from "./tasks.service";
import {
  isValidTaskStatus,
  type AssignTaskBodyInput,
  type CreateTaskBodyInput,
  type TaskListQuery,
  type UpdateTaskBodyInput,
} from "./dto/tasks.dto";

@Controller("/api/tasks")
@UseGuards(BetterAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post("/")
  async create(
    @Req() req: RequestWithSession,
    @Body()
    body: CreateTaskBodyInput,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      throw new AppError("VALIDATION_ERROR", "title must be a non-empty string", 400);
    }

    const description =
      body.description === undefined
        ? undefined
        : body.description === null
          ? undefined
          : typeof body.description === "string"
            ? body.description
            : (() => {
                throw new AppError("VALIDATION_ERROR", "description must be a string", 400);
              })();

    const status =
      body.status === undefined
        ? undefined
        : isValidTaskStatus(body.status)
          ? body.status
          : (() => {
              throw new AppError("VALIDATION_ERROR", "Invalid status", 400);
            })();

    const assigneeId =
      body.assigneeId === undefined
        ? undefined
        : body.assigneeId === null
          ? null
          : typeof body.assigneeId === "string"
            ? body.assigneeId
            : (() => {
                throw new AppError("VALIDATION_ERROR", "assigneeId must be a string", 400);
              })();

    const task = await this.tasksService.createTask({
      ownerId: session.user.id,
      title: body.title.trim(),
      description,
      status,
      assigneeId,
    });

    return successResponse(task);
  }

  @Get("/")
  async list(
    @Req() req: RequestWithSession,
    @Query() query: TaskListQuery,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const { page, limit } = parsePagination(query);

    const result = await this.tasksService.listTasks({
      userId: session.user.id,
      role: session.user.role,
      page,
      limit,
      status: query.status,
    });

    return paginatedResponse(result.tasks, result.total, result.page, result.limit);
  }

  @Get("/:id")
  async getById(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const task = await this.tasksService.getTaskById({
      taskId: id,
      userId: session.user.id,
      role: session.user.role,
    });

    return successResponse(task);
  }

  @Patch("/:id")
  async update(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
    @Body()
    body: UpdateTaskBodyInput,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const title =
      body.title === undefined
        ? undefined
        : typeof body.title === "string"
          ? body.title.trim()
          : (() => {
              throw new AppError("VALIDATION_ERROR", "title must be a string", 400);
            })();

    const description =
      body.description === undefined
        ? undefined
        : body.description === null
          ? null
          : typeof body.description === "string"
            ? body.description
            : (() => {
                throw new AppError("VALIDATION_ERROR", "description must be a string", 400);
              })();

    const status =
      body.status === undefined
        ? undefined
        : isValidTaskStatus(body.status)
          ? body.status
          : (() => {
              throw new AppError("VALIDATION_ERROR", "Invalid status", 400);
            })();

    const task = await this.tasksService.updateTask({
      taskId: id,
      userId: session.user.id,
      role: session.user.role,
      title,
      description,
      status,
    });

    return successResponse(task);
  }

  @Post("/:id/assign")
  async assign(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
    @Body() body: AssignTaskBodyInput,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const assigneeId =
      body.assigneeId === undefined
        ? undefined
        : body.assigneeId === null
          ? null
          : typeof body.assigneeId === "string"
            ? body.assigneeId
            : (() => {
                throw new AppError("VALIDATION_ERROR", "assigneeId must be a string", 400);
              })();

    if (assigneeId === undefined) {
      throw new AppError("VALIDATION_ERROR", "assigneeId is required", 400);
    }

    const task = await this.tasksService.assignTask({
      taskId: id,
      userId: session.user.id,
      role: session.user.role,
      assigneeId,
    });

    return successResponse(task);
  }
}

