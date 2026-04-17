import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import AuthGuard from "@/components/providers/AuthGuard";

const ENABLE_AUTH = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Contexta | 실시간 AI 미팅 코파일럿",
  description:
    "B2B 영업대표를 위한 실시간 AI 미팅 코파일럿. 미팅 중 즉각적인 코칭 힌트와 문맥 요약을 제공합니다.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Contexta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}
      >
        {ENABLE_AUTH ? (
          <AuthProvider>
            <AuthGuard>{children}</AuthGuard>
          </AuthProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
