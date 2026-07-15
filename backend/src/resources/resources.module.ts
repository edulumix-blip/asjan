import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from './schemas/resource.schema';
import { ResourcesService } from './resources.service';
import { ResourceFetchService } from './resource-fetch.service';
import { ResourcesController } from './resources.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourceFetchService],
  exports: [ResourcesService, ResourceFetchService],
})
export class ResourcesModule {}
