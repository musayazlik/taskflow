import { Module } from "@nestjs/common";

import { AiModelsController } from "./ai-models.controller";

@Module({
  controllers: [AiModelsController],
})
export class AiModelsModule {}

