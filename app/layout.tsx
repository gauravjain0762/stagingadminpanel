import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Queue Token – Admin Panel",
  description: "Healthcare appointment booking platform admin dashboard",
  icons: {
    icon: "https://res.cloudinary.com/dbazlbkfj/image/upload/v1780046292/icon-removebg-preview_jirlb4.png",
    apple: "https://res.cloudinary.com/dbazlbkfj/image/upload/v1780046292/icon-removebg-preview_jirlb4.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint to avoid flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <ThemeProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
