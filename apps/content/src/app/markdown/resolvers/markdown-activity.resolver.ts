import { Inject } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { CRUDResolver } from '@nestjs-query/query-graphql';

import { MarkdownActivity } from '../graphql-types/markdown-activity';
import { MarkdownActivityService } from '../services/markdown-activity.service';

@Resolver(() => MarkdownActivity)
export class MarkdownActivityResolver extends CRUDResolver(MarkdownActivity, {
  read: { disabled: false },
  update: { disabled: true },
  create: { disabled: true },
  delete: { disabled: true },
  enableTotalCount: true,
}) {
  constructor(@Inject(MarkdownActivityService) readonly service: MarkdownActivityService) {
    super(service);
  }
}
