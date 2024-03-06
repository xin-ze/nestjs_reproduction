import React from 'react';
import type { ReactNode } from 'react';
import type { DefaultTheme } from 'styled-components';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from './GlobalStyle';
import { juiTheme } from './juiTheme';

export const StyledThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={juiTheme as DefaultTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};
