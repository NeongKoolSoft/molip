import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Molip | AI 기반 자기이해 서비스",
  description: "당신은 무엇에 반복적으로 반응합니까? Molip은 매일의 기록을 분석해 반복되는 반응과 몰입의 신호를 발견하도록 돕는 AI 기반 자기이해 서비스입니다.",
  verification: {
    google: "5oDKA3O3Do8M1fi9bM8PunDWLsP0gnsBMmXRgkByem4",
    other: {
      "naver-site-verification":
        "2940e31a6143788833c112d016fc7b19c49b70c7",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17811031025"
          strategy="afterInteractive"
        />

        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17811031025');
          `}
        </Script>
      </body>
    </html>
  );
}