import type { Metadata } from "next";
import { Alexandria, Outfit } from "next/font/google";
import "./globals.css";
import AX_Toast from "@/components/ui/AX_Toast";
import AX_BackgroundWrapper from "@/components/ui/AX_BackgroundWrapper";

import { AX_ThemeProvider } from "@/components/providers/AX_ThemeProvider";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "الكنز ستور | أكبر تشكيلة أدوات منزلية واكسسوارات",
  description: "أكبر تشكيله من الأدوات المنزلية والاكسسوارات والميكب وألعاب الأطفال والديكور في مصر وب ٣٥ جنية بس",
  icons: {
    icon: "/favicon.png?v=1",
    apple: "/apple-icon.png?v=1",
    shortcut: "/favicon.png?v=1",
  },
  manifest: "/manifest.json",
  themeColor: "#a17a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${alexandria.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        <AX_ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AX_BackgroundWrapper />
          {children}
          <AX_Toast />
        </AX_ThemeProvider>
      </body>
    </html>
  );
}

