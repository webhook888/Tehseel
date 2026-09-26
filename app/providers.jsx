"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/poppins"; // Defaults to weight 400
import "@fontsource/poppins/400.css"; // Specify weight
import "@fontsource/poppins/400-italic.css"; // Specify weight and style
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: `'Poppins'`,
    body: `'Poppins'`,
  },
  colors: {
    brand: {
      50: "#e6f0ff",
      500: "#1a56db",
      600: "#1544ad",
    },
  },
  styles: {
    global: {
      html: { p: 0, m: 0 },
      body: { bg: "gray.50", p: 0, m: 0 },
      "*": { boxSizing: "border-box" },
      "@media print": {
        "@page": { size: "80mm auto", margin: 0 },
        "html, body": {
          bg: "white !important",
          m: "0 !important",
          p: "0 !important",
        },
        header: { display: "none !important" },
      },
    },
  },
});

export default function Providers({ children }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
