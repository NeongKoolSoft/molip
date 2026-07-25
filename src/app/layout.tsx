import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://molip.help"),

  title: "Molip | 자기이해 기록 서비스",

  description:
    "당신은 무엇에 반복적으로 반응합니까? Molip은 매일의 기록 속에서 반복되는 반응과 생각의 흐름, 그리고 몰입의 신호를 발견하도록 돕는 자기이해 기록 서비스입니다.",

  alternates: {
    canonical: "/",
  },

  verification: {
    google: "5oDKA3O3Do8M1fi9bM8PunDWLsP0gnsBMmXRgkByem4",

    other: {
      "naver-site-verification":
        "6c08d559b1847326923398160410c3dca230dbe7",
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