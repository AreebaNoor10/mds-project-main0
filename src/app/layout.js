import "./globals.css";
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import HeaderWrapper from "@/Components/HeaderWrapper";

export const metadata = {
  title: "Material Certificate",
  description: "Material Certificate review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <AppRouterCacheProvider>
        <body>
          <HeaderWrapper>{children}</HeaderWrapper>
        </body>
      </AppRouterCacheProvider>
    </html>
  );
}
