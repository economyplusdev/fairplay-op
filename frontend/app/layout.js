import "./globals.css";
import { ThemeModeScript } from "flowbite-react";
import { Header } from "@/components/tabs/header";
import { Providers } from "./provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <ThemeModeScript />
      </head>
      <body>
        <Providers>
          {/* 
            The <Header> now handles either:
            - Dashboard layout (nav + sidebar + offset content)
            - Normal nav + content
          */}
          <Header>
            {children}
          </Header>
        </Providers>
      </body>
    </html>
  );
}
