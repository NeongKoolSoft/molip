import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

const siteUrl = "https://molip.help";

const siteDescription =
  "Molip는 매일의 기록에서 반복되는 반응을 발견해, 사용자가 자신이 무엇에 끌리고 몰입하는지 이해하도록 돕는 자기이해 기록 서비스입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Molip | 몰입 발견을 돕는 자기이해 기록 서비스",
    template: "%s | Molip",
  },

  description: siteDescription,

  keywords: [
    "Molip",
    "몰립",
    "자기이해",
    "자기이해 기록",
    "몰입 발견",
    "하루 기록",
    "감정 기록",
    "일상 기록",
    "AI 기록 분석",
    "몰입",
  ],

  applicationName: "Molip",

  authors: [
    {
      name: "Molip",
      url: siteUrl,
    },
  ],

  creator: "Molip",
  publisher: "Molip",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "Molip",
    title: "Molip | 몰입 발견을 돕는 자기이해 기록 서비스",
    description:
      "하루 1분 기록으로 반복되는 반응과 몰입의 신호를 발견해보세요.",
  },

  twitter: {
    card: "summary",
    title: "Molip | 몰입 발견을 돕는 자기이해 기록 서비스",
    description:
      "하루 1분 기록으로 반복되는 반응과 몰입의 신호를 발견해보세요.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  verification: {
    google: "5oDKA3O3Do8M1fi9bM8PunDWLsP0gnsBMmXRgkByem4",

    other: {
      "naver-site-verification":
        "6c08d559b1847326923398160410c3dca230dbe7",
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Molip",
      alternateName: "몰립",
      description: siteDescription,
      inLanguage: "ko-KR",
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#application`,
      name: "Molip",
      alternateName: "몰립",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "JavaScript를 지원하는 웹 브라우저",
      inLanguage: "ko-KR",
      slogan: "당신은 무엇에 반복적으로 반응합니까?",
      isAccessibleForFree: true,
      publisher: {
        "@type": "Organization",
        name: "Molip",
        url: siteUrl,
      },
    },
  ],
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
          id="molip-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>

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