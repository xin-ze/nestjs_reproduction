import { createGlobalStyle, css } from 'styled-components';

export const GlobalStyle = createGlobalStyle((props) => {
  const { theme } = props;
  return css`
    .Toastify {
      white-space: pre-line;
    }

    .template-default > .nav {
      width: 16rem;

      nav a {
        padding-right: 0.5rem;
      }
    }

    // hide section title for blocks in article and divider block
    .article-rich-text-blocks,
    .blocks-field__block-pill-divider-block {
      div.section-title {
        display: none;
      }
    }

    .rich-text__editor {
      hr {
        margin: 40px 0;
      }
    }

    /* override buggy style of payload */
    .checkbox--read-only {
      button .checkbox__input svg {
        opacity: 0;
      }

      &.checkbox--checked button .checkbox__input svg {
        opacity: 0.2;
      }
    }

    .group-field--within-tab {
      margin: initial;

      &:last-child {
        padding: 3.8461538462rem 0;
      }
    }

    #field-heroCtaProps,
    #field-containerWidth {
      border: 0;
      padding: 0;
    }

    /* To group tab content inside a border */
    .tabs-field__content-wrap {
      border-bottom: 1px solid var(--theme-elevation-100);
      padding-bottom: 1.9230769231rem;
    }

    .rich-text {
      .rich-text__input {
        & > [data-slate-node='element'] {
          margin-bottom: 1.5em;
        }
      }

      .rich-text-link {
        color: ${theme.color.PrimaryDefault};
        text-decoration: none;

        .rich-text-link__button {
          text-decoration: none;
        }

        &:hover {
          text-decoration: underline;
        }
      }

      &.error {
        ul:not(.rich-text__input > ul),
        ol:not(.rich-text__input > ol),
        li:not(ul > li, ol > li) {
          border-right: 2px red solid;
        }

        table:not(.rich-text__input > table) {
          th,
          td {
            :last-child {
              border-right: 2px red solid;
            }
          }
        }
      }
    }

    blockquote {
      margin-left: initial;
      margin-right: initial;

      padding: 24px;
      background-color: ${({ theme }) => theme.color.GrayscaleBackground};
      border-left: 4px solid ${({ theme }) => theme.color.PrimaryDefault};

      b {
        font-size: 18px;
        color: ${({ theme }) => theme.color.PrimaryDefault};
      }
    }

    .collapsible-field {
      margin-bottom: 1.9230769231rem;
    }

    .collection-edit__sidebar-wrap {
      .field-error.tooltip {
        white-space: pre-line;
      }
    }

    /* Hide deprecated variants */
    /* TODO: remove this when we delete the options */
    #field-variant {
      label[for='field-variant-newsSecondary'],
      label[for='field-variant-article'],
      label[for='field-variant-articleSecondary'] {
        display: none;
      }
    }
    div[id*='sectionStyles-row'] {
      display: inline-block;
      width: 50%;
      padding: 0 10px;
      vertical-align: top;
    }

    .section-styles-array .render-fields.row > .field-type {
      display: block;
      width: 100% !important;
    }

    .rich-text-as-title .rich-text__input {
      min-height: 4rem;
    }
  `;
});
