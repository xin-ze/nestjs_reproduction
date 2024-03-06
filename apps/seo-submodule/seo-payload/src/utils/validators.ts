import type { Validate } from 'payload/types';
import { text } from 'payload/dist/fields/validations';
import { isEmpty } from 'lodash';

import type { PayloadRichText } from '@jerry-serverless/payload-types';

// TODO: move it to a better place when it's necessary
export const regexes = {
  url: /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  // comparing to normal slug, / is also allowed as word separator
  slugWithSlash: /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/,
  // comparing to normal slug, case is ignored
  slugAsId: /^[a-z0-9/]+(?:[-_][a-z0-9/]+)*$/i,
};

/**
 * Special format slug that has been used, if you modify this, please also update the following documents:
 * https://www.notion.so/jerrydesign/All-the-SEO-special-slugs-113f58c59c9e4297ac140b2134069337
 */
const specialArticlesSlugs: Record<string, RegExp[]> = {
  'car-loan': [
    // StateDetailPage
    /^(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|district-of-columbia|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)$/,
    // ProviderRefinancePage
    /^[A-Za-z0-9-]+-refinance$/,
    // RefinanceProviderReviewPage
    /^refinance-[A-Za-z0-9-]+-auto-loan$/,
  ],
};

export const oneOf = <T = unknown>(allowedValues: T[]) => (value: T) => {
  if (!allowedValues.includes(value)) {
    return `only ${allowedValues.join()} is allowed`;
  }
  return true;
};

export const isUrl: Validate<string> = (value, args) => {
  if (value && !value.match(regexes.url)) {
    return `only URL is allowed`;
  }
  return text(value, args);
};

/**
 * slugs below are invalid:
 *  1. invalid characters: `â€-some-slug`
 *  2. starts with dash: `-some-slug`
 *  3. uppercase: 'Some-slug'
 *  4. white spaces: ' some-slug '
 *  5. double dashes: 'some--slug'
 *
 * This is just in case coders forget to add formatSlugBeforeValidate hooks for a slug field
 *
 * @param value
 * @param args
 * @returns
 *
 */
export const isSlug: Validate<string> = (value, args) => {
  if (value?.match(/[A-Z]/)) {
    return 'Upper case is not allowed';
  }
  if (value?.includes('--')) {
    return 'Double-dashes `--` is not allowed';
  }
  if (value && !value.match(regexes.slug)) {
    return 'Invalid characters detected in slug\n Please clear this field and type in the slug manually!';
  }
  return text(value, args);
};

export const isSlugWithSlash: Validate<string> = (value, args) => {
  if (value?.match(/[A-Z]/)) {
    return 'Upper case is not allowed';
  }
  if (value?.includes('--')) {
    return 'Double-dashes `--` is not allowed';
  }
  if (value && !value.match(regexes.slugWithSlash)) {
    return 'Invalid characters detected in slug\n Please clear this field and type in the slug manually!';
  }
  return text(value, args);
};

/**
 * For article slug, need to additionally check if it conflicts with specialArticlesSlugs
 * @param value
 * @param args
 * @returns
 */
export const isArticleSlug: Validate<string> = (value, args) => {
  if (value) {
    const category = args?.data.category;
    if (category) {
      const regExps = specialArticlesSlugs[category];

      if (!isEmpty(regExps) && regExps.some((_) => value.match(_))) {
        return 'Slug conflicts with specialSlugs, you can check here: https://www.notion.so/jerrydesign/All-the-SEO-special-slugs-113f58c59c9e4297ac140b2134069337';
      }
    }
  }
  return isSlug(value, args);
};

/**
 * To validate if the rich text has line break.
 * @param richText
 * @returns
 */
export const multipleLineValidate = (richText?: PayloadRichText) => {
  if ((richText?.length ?? 0) > 1) {
    return 'Not allowed to add line breaks.';
  }
  return true;
};

/**
 * check if the value is not empty, skip check if the status is draft
 */
export const isNotEmpty: Validate = (value, { siblingData }) =>
  siblingData?._status === 'draft' || !!value || 'This is required!';
