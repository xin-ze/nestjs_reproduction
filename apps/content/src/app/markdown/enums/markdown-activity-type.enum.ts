import { registerEnumType } from '@nestjs/graphql';

export enum MarkdownActivityTypeEnum {
  Create = 0,
  Update = 1,
  Delete = 2,
}

registerEnumType(MarkdownActivityTypeEnum, { name: 'MarkdownActivityType' });
