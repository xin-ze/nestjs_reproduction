import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MarkdownActivityUserInfo {
  @Field()
  name: string;
}
