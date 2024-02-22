import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { MarkdownActivityTypeEnum } from '../enums/markdown-activity-type.enum';

import { IMarkdownActivity } from './markdown-activity.interface';

@Entity('markdown_activities')
export class MarkdownActivity extends IMarkdownActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MarkdownActivityTypeEnum })
  type: MarkdownActivityTypeEnum;

  @Column()
  markdownId: string;

  // Save old content (in case of update or delete) to allow
  // diff'ing and restoring.
  @Column({ type: 'text', nullable: true })
  oldContent?: string;

  @Column()
  userId: string;

  // Additional user info (e.g. user's name, etc).
  // Useful for quick display of activities without having to hit
  // any other service to resolve userID -> user info.
  @Column({ type: 'jsonb', nullable: true })
  userInfo?: { name: string; email?: string };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
