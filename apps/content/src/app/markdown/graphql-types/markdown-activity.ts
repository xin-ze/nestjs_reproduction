import { ObjectType, Field } from '@nestjs/graphql';
import { FilterableField, OffsetConnection, Relation } from '@nestjs-query/query-graphql';

import { MarkdownActivityTypeEnum } from '../enums/markdown-activity-type.enum';

import { MarkdownActivityUserInfo } from './markdown-activity-user-info';
// import { Markdown } from './markdown';

@ObjectType()
export class MarkdownActivity {
  @Field()
  id: string;

  @Field(() => MarkdownActivityTypeEnum)
  type: MarkdownActivityTypeEnum;

  @Field({ nullable: true })
  oldContent?: string;

  @Field()
  userId: string;

  @Field(() => MarkdownActivityUserInfo, { nullable: true })
  userInfo?: MarkdownActivityUserInfo;

  @FilterableField()
  markdownId: string;

  @Field()
  createdAt: Date;

  @FilterableField()
  updatedAt: Date;
}
