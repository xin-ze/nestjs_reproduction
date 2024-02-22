import type { MarkdownActivityTypeEnum } from '../enums/markdown-activity-type.enum';


export class IMarkdownActivity {
  id: string;
  type: MarkdownActivityTypeEnum;
  markdownId: string;
  oldContent?: string;
  userId: string;
  userInfo?: { name: string; email?: string };
  createdAt: Date;
  updatedAt: Date;
}
