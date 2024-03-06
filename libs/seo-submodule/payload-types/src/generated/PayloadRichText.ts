// This file is implemented by ourselves, but it should be generated with payload-types
// TODO: replace these richtext types when payload supports officially

import type { ReactNode } from 'react';

import type {
  Media,
  Card,
  Table,
  FaqList,
  TwitterWidget,
  Video,
  StaticComponent,
  SeoCardList,
  HighlightSection,
  DynamicComponent,
  DynamicText,
  DynamicTable,
  HeroCta,
  DynamicRealQuotesTable,
  CarrierReviewsTable,
  Button,
  UsedCarGeneratedDescriptionCard,
  UsedCarDetailCard,
} from './payload-types';
import type { AverageInsuranceTable } from './payload-types';
import type { CarRepairQuoteCostTable } from './payload-types';

export interface Text {
  type?: never;
  value?: never;
  text: string;
}

export interface TextWithMark extends Text {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// TODO: support linkType with internal link
export interface HyperLink {
  type: 'link';
  linkType?: 'custom';
  url: string;
  children: TextWithMark[];
  newTab?: boolean;
}

export interface Citation {
  type: 'citation';
  label: string;
  content: RichTextItem[];
  children: TextWithMark[];
}

export interface ShortHeading {
  type: 'short-heading';
  children: Exclude<InlineNode, ShortHeading>[];
}

export type InlineNode =
  | TextWithMark
  | HyperLink
  | Citation
  | RichTextContextField
  | ShortHeading
  | RichTextDynamicText;

export interface HeadingNode {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: InlineNode[];
  isVoid?: boolean;
}

export interface Hr {
  type: 'hr';
  children: Text[];
  isVoid?: boolean;
}

export interface BodyNode {
  type?: 'paragraph' | 'p';
  children: InlineNode[];
  isVoid?: boolean;
}

export type Paragraph = HeadingNode | BodyNode;

export interface List {
  type: 'ul' | 'ol';
  children: ListItem[];
}

export interface ListItem {
  type: 'li';
  children: InlineNode[];
}

export interface BaseTableNode {
  type: 'table' | 'table-header' | 'table-body' | 'table-row' | 'table-cell' | 'table-header-cell';
  children?: unknown[];
}

export interface TableNode extends BaseTableNode {
  type: 'table';
  children: [TableHeader, TableBody];
}

export type RichTextTable = TableNode;

export interface TableHeader extends BaseTableNode {
  type: 'table-header';
  children: [TableRow];
}
export interface TableBody extends BaseTableNode {
  type: 'table-body';
  children: TableRow[];
}
export interface TableRow extends BaseTableNode {
  type: 'table-row';
  children: TableHeaderCell[] | TableCell[];
}
export interface TableHeaderCell extends BaseTableNode {
  type: 'table-header-cell';
  rowSpan?: number;
  colSpan?: number;
  children: BodyNode[] | PayloadRichText;
}
export interface TableCell extends BaseTableNode {
  type: 'table-cell';
  rowSpan?: number;
  colSpan?: number;
  children: BodyNode[] | PayloadRichText;
}

export interface Upload {
  type: 'upload';
  value: Media;
  relationTo: 'media';
  children: Text[];
  // when not setting any extra field of the upload element, this attribute doesn't exist
  fields?: {
    alignment?: 'left' | 'center' | 'right';
    link?: string;
    caption?: PayloadRichText;
    newTab?: boolean;
  };
}

export type Relationship = {
  type: 'relationship';
  children: Text[];
  value: { id: string } & Record<string, unknown>;
  relationTo: string;
};

// Generated type is inaccurate
export interface RichTextContextField {
  type: 'context-fields';
  children: Text[];
  name?: string;
  fieldName?: string;
  displayType?: 'block' | 'inline' | 'link';
}

// Generated type is inaccurate
export interface RichTextDynamicText {
  type: 'dynamic-texts';
  children: Text[];
  name?: string;
  id?: string;
  filters: DynamicText['filters'];
  dataType: string;
}

export interface Blockquote {
  type: 'blockquote';
  children: BlockNode[];
}
export interface Indent {
  type: 'indent';
  children: BlockNode[];
}

export type BlockNode = Paragraph | Hr | Blockquote | Indent | List | Upload | Relationship | RichTextTable;

export interface NodeRenderer {
  (node: BlockNode, children: ReactNode): ReactNode;
}

export type RichTextTableMiddleNode = TableHeader | TableBody | TableRow | TableHeaderCell | TableCell;

// RichTextItem includes all block nodes and inline nodes and other middle nodes in list and table
export type RichTextItem =
  // block nodes
  | BlockNode
  // inline nodes
  | InlineNode
  // middle nodes in list
  | ListItem
  | RichTextTableMiddleNode;

export type PayloadRichText = BlockNode[];

export interface RichTextDynamicComponent
  extends Omit<
    DynamicComponent,
    'state' | 'states' | 'city' | 'carrier' | 'carrier2' | 'carMake' | 'carModel' | 'carRepairService'
  > {
  state?: Partial<Exclude<DynamicComponent['state'], string>>;
  states?: Partial<Exclude<DynamicComponent['state'], string>>[];
  city?: Partial<Exclude<DynamicComponent['city'], string>>;
  carrier?: Partial<Exclude<DynamicComponent['carrier'], string>>;
  carrier2?: Partial<Exclude<DynamicComponent['carrier2'], string>>;
  carMake?: Partial<Exclude<DynamicComponent['carMake'], string>>;
  carModel?: Partial<Exclude<DynamicComponent['carModel'], string>>;
  carRepairService?: Partial<Exclude<DynamicComponent['carRepairService'], string>>;
}

export type RichTextRelationship = {
  type: 'relationship';
  children: Text[];
} & (
  | {
      value: Media;
      relationTo: 'media';
    }
  | {
      value: Card;
      relationTo: 'cards';
    }
  | {
      value: TwitterWidget;
      relationTo: 'twitter-widgets';
    }
  | {
      value: Table;
      relationTo: 'tables';
    }
  | {
      value: FaqList;
      relationTo: 'faq-lists';
    }
  | {
      value: RichTextContextField;
      relationTo: 'context-fields';
    }
  | {
      value: StaticComponent;
      relationTo: 'static-components';
    }
  | {
      value: HighlightSection;
      relationTo: 'highlight-sections';
    }
  | {
      value: RichTextDynamicComponent;
      relationTo: 'dynamic-components';
    }
  | {
      value: Video;
      relationTo: 'videos';
    }
  | {
      value: SeoCardList;
      relationTo: 'seo-card-lists';
    }
  | {
      value: DynamicTable;
      relationTo: 'dynamic-tables';
    }
  | {
      value: DynamicRealQuotesTable;
      relationTo: 'dynamic-real-quotes-tables';
    }
  | {
      value: Button;
      relationTo: 'buttons';
    }
  | {
      value: HeroCta;
      relationTo: 'hero-ctas';
    }
  | {
      value: CarrierReviewsTable;
      relationTo: 'carrier-reviews-tables';
    }
  | {
      value: AverageInsuranceTable;
      relationTo: 'average-insurance-tables';
    }
  | {
      value: CarRepairQuoteCostTable;
      relationTo: 'car-repair-quote-cost-tables';
    }
  | {
      value: UsedCarGeneratedDescriptionCard;
      relationTo: 'used-car-generated-description-card';
    }
  | {
      value: UsedCarDetailCard;
      relationTo: 'used-car-detail-card';
    }
);
