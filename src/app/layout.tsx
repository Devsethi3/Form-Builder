import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800",] });
import NextTopLoader from 'nextjs-toploader'
import { ClerkProvider } from "@clerk/nextjs";
import { DesignerContextProvider } from "@/context/DesignerContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Quick Form Builder",
  description: "Create forms quickly and easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.className}>
        <body>
          <NextTopLoader
            color="#2299DD"
            initialPosition={0.08}
            crawlSpeed={200}
            showSpinner={true}
            height={4}
            crawl={true}
            easing="ease" />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DesignerContextProvider>
              {children}
              <Toaster />
            </DesignerContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}