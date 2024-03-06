export interface RichText {
  children: RichText[];
  text?: string;
}

export const stringifyRichText = (value: string | RichText[]) => {
  if (typeof value === 'string') {
    return value;
  } else {
    let result = '';
    if (Array.isArray(value)) {
      for (const { children, text } of value) {
        result += stringifyRichText(children);
        result += text ?? '';
      }
    }
    return result;
  }
};
