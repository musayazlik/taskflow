import { Module } from "@nestjs/common";

import { FileStorageController } from "./file-storage.controller";
import { StorageSettingsController } from "./storage-settings.controller";

@Module({
  controllers: [FileStorageController, StorageSettingsController],
})
export class FileStorageModule {}

