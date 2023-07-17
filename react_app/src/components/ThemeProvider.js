import { ThemeProvider } from "styled-components";
import { theme } from "antd";
import React from "react";

export default ({ children }) => {
  const { token } = theme.useToken();
  return (
    <ThemeProvider theme={{ antd: token }}>
      {children}
    </ThemeProvider>
  );
};