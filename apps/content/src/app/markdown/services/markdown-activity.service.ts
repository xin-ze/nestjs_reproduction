import { InjectRepository } from '@nestjs/typeorm';
import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Repository } from 'typeorm';

import { MarkdownActivity as MarkdownActivityEntity } from '../entities/markdown-activity.entity';

@QueryService(MarkdownActivityEntity)
export class MarkdownActivityService extends TypeOrmQueryService<MarkdownActivityEntity> {
  constructor(@InjectRepository(MarkdownActivityEntity) repo: Repository<MarkdownActivityEntity>) {
    super(repo);
  }
}
