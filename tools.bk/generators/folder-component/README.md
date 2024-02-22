# component code generator

### Getting started

```
npm run gen:folder-component ArticleGrid

> jerry-serverless@0.0.0 gen:folder-component /Users/stupidism/Documents/jerry-serverless
> nx workspace-schematic folder-component "ArticleGrid"

? What is the name of the project for this component?(Skip if directory specified) ui-content
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/ArticleGrid.tsx
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/const.ArticleGrid.tsx
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/index.tsx
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/styled.ArticleGrid.ts
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/types.ArticleGrid.ts
CREATE apps/seo-submodule/ui-content/components/ArticleGrid/useArticleGrid.tsx
```

### Folder structure

This code generator generates a component folder with structure like this:

- `Component/`
  - \* `index.ts` Entry point for this component. Everything need to be exported from this component should be exported here with a proper name. When necessary you can export not just your component, but also your hook, constants and types for reusability.
  - \* `Component.tsx` The component file or the render logic part which defines dom structure of this component and combines the rest parts together.
  - `useComponent.ts` The hook file or the logic part where you write your data-fetching query, states and callbacks
  - `styled.Component.ts` The css file or the style part where you write your styled components. Notice: I don't recommend writing too many styled components if not necessary. Normal class names inside a root styled-component is good enough to isolate css.
    > If you're concerned about the `import * as S` part in `Component.tsx`, read [this article](https://medium.com/inturn-eng/naming-styled-components-d7097950a245) to see why it's a best practice.
  - `const.Component.ts` The constant file where you write constants and use them in your component file, hook file or css file.
  - `types.Component.ts` The type file where you define the input and output of your component and hook.
    > `*` means required file in the folder, the other files are not required, you can delete if you don't need them after creation.

### Read more

[Click here to read more](https://github.com/Stupidism/stupic) about the idea behind this `folder component`
