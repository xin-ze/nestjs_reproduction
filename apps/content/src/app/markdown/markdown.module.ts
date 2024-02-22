import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkdownActivityResolver } from './resolvers/markdown-activity.resolver';

import { MarkdownActivityService } from './services/markdown-activity.service';

import { MarkdownActivity } from './entities/markdown-activity.entity';


/**
 * Module used for storing markdown in DB so that it is editable
 * from CMS.
 *
 * Allows embedding references to other markdown records. Example:
 *
 * markdown1: "Some markdown content. Embedded content: ```jerry:markdown2```".
 * markdown2: "Some other content".
 *
 * Resolving text of markdown1 will give: "Some markdown content. Emebdded content: Some other content".
 *
 * This will be useful for composing pages such as the `States SEO pages`, where there is
 * a single content template for all states with some sections that are different for each
 * state. In this case, we can:
 * 1) Get the base `state` template markdown.
 * 2) String-replace embedded reference, e.g. ```jerry:state-intro``` -> ```jerry:CA-intro```.
 * 3) Resolve references to obtain final markdown that can be rendered.
 */

@Module({
  exports: [],
  imports: [
    TypeOrmModule.forFeature([MarkdownActivity]),
  ],
  providers: [
    MarkdownActivityService,
    MarkdownActivityResolver,
  ],
})
export class MarkdownModule {}
