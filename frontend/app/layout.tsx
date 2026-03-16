import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AuthGuard from "@/components/common/auth-guard";
import Navigation from "@/components/layout/navigation";
import LeftMenu from "@/components/layout/left-menu";
import AppBreadcrumb from "@/components/layout/breadcrumb";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PartnerHub",
  description: "PartnerHub - Full-stack project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <Providers>
            <AuthGuard>
              <Navigation />
              <div className="flex h-[calc(100vh-56px)]">
                <LeftMenu />
                <main className="flex-1 bg-white overflow-hidden flex flex-col">
                  <AppBreadcrumb />
                  <div className="flex-1 overflow-auto">{children}</div>
                </main>
              </div>
            </AuthGuard>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
