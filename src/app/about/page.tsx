import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const siteUrl = "https://www.molip.help";

export const metadata: Metadata = {
  title: "Molip 소개",
  description:
    "Molip이 해결하려는 문제와 작동 방식, 서비스 원칙, 현재 베타 단계의 한계를 소개합니다.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${siteUrl}/about`,
    siteName: "Molip",
    title: "Molip 소개 | 자기이해 기록 서비스",
    description:
      "매일의 기록에서 반복되는 반응과 몰입의 신호를 발견하도록 돕는 Molip을 소개합니다.",
    images: [
      {
        url: "/images/molip-og.png",
        width: 1200,
        height: 630,
        alt: "Molip — 당신은 무엇에 반복적으로 반응합니까?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Molip 소개 | 자기이해 기록 서비스",
    description:
      "매일의 기록에서 반복되는 반응과 몰입의 신호를 발견하도록 돕는 Molip을 소개합니다.",
    images: ["/images/molip-og.png"],
  },
};

const principles = [
  {
    title: "사람을 단정하지 않습니다",
    description:
      "기록을 근거로 가능한 흐름과 질문을 제시하지만, 사용자가 어떤 사람인지 결론 내리지 않습니다.",
  },
  {
    title: "반복되는 반응을 봅니다",
    description:
      "하루의 감정을 좋고 나쁨으로 평가하기보다, 무엇에 계속 관심과 에너지가 향하는지 살펴봅니다.",
  },
  {
    title: "해석과 선택은 사용자에게 남깁니다",
    description:
      "Molip은 자신을 이해할 단서를 제공합니다. 그 의미를 해석하고 다음을 선택하는 일은 사용자의 몫입니다.",
  },
  {
    title: "기록이 쌓이는 시간을 존중합니다",
    description:
      "한 번의 기록으로 성급하게 판단하지 않고, 기록 사이의 반복과 변화를 관찰합니다.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${siteUrl}/about/#about`,
  url: `${siteUrl}/about`,
  name: "Molip 소개",
  description:
    "Molip은 매일의 기록에서 반복되는 반응과 몰입의 신호를 발견하도록 돕는 한국어 자기이해 기록 서비스입니다.",
  inLanguage: "ko-KR",
  isPartOf: {
    "@id": `${siteUrl}/#website`,
  },
  about: {
    "@id": `${siteUrl}/#application`,
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbfcf9] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#fbfcf9]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            aria-label="Molip 홈으로 이동"
            className="flex items-center gap-2"
          >
            <Image
              src="/images/molip-logo.png"
              alt="Molip"
              width={138}
              height={48}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />

            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Beta
            </span>
          </Link>

          <Link
            href="/app"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Beta 시작하기
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            About Molip
          </p>

          <h1 className="mt-6 break-keep text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            사람이 자기 자신과
            <br />
            더 깊이 연결되도록
          </h1>

          <p className="mx-auto mt-8 max-w-2xl break-keep text-lg leading-8 text-slate-600">
            Molip은 매일의 기록에서 반복되는 반응과 생각의 흐름을 발견해,
            사용자가 자신이 무엇에 끌리고 몰입하는지 이해하도록 돕는
            한국어 자기이해 기록 서비스입니다.
          </p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              The problem
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              우리는 반응하지만,
              <br />
              그 반복은 쉽게 놓칩니다.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              사람은 매일 여러 대상과 생각에 반응합니다. 어떤 일에는
              에너지가 생기고, 어떤 고민은 계속 돌아오며, 어떤 활동에서는
              시간 가는 줄 모릅니다.
            </p>

            <p>
              하지만 하루가 지나면 각각의 반응은 흩어집니다. Molip은 기록과
              기록을 연결해, 혼자서는 알아보기 어려웠던 반복과 변화를
              발견하도록 돕습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              How it works
            </p>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Molip의 작동 방식
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "하루를 기록합니다", "오늘 기억에 남은 생각과 반응을 자유롭게 적습니다."],
              ["02", "반복과 변화를 찾습니다", "AI가 최근 기록을 연결해 자주 나타나는 대상과 반응의 흐름을 살펴봅니다."],
              ["03", "자기이해의 단서를 만납니다", "사용자는 발견된 신호와 질문을 통해 자신의 경험을 다시 해석합니다."],
            ].map(([number, title, description]) => (
              <article
                key={number}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <p className="text-sm font-bold text-emerald-700">{number}</p>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-4 break-keep text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              Principles
            </p>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Molip이 지키는 원칙
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <h3 className="text-xl font-bold">{principle.title}</h3>
                <p className="mt-4 break-keep text-sm leading-7 text-slate-300">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Beta status
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              현재 Molip은
              <br />
              베타 서비스입니다.
            </h2>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
            <ul className="space-y-4 text-sm leading-7 text-slate-700">
              <li>분석 결과는 사용자의 기록 내용과 기록량에 영향을 받습니다.</li>
              <li>AI가 제시하는 해석은 완전하거나 항상 정확하지 않을 수 있습니다.</li>
              <li>의료·심리 진단이나 전문적인 상담을 대신하지 않습니다.</li>
              <li>실제 사용 경험을 관찰하며 기능과 질문 방식을 개선하고 있습니다.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-emerald-100 px-7 py-14 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
            Operation & contact
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight">
            운영 및 문의
          </h2>

          <p className="mx-auto mt-6 max-w-xl break-keep text-sm leading-7 text-slate-600">
            Molip은 한국어 사용자를 대상으로 운영되고 있습니다.
            서비스 이용과 개인정보 처리에 관한 내용은 아래 공식 문서에서
            확인할 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <Link href="/contact" className="text-emerald-900 underline underline-offset-4">
              문의하기
            </Link>
            <Link href="/privacy" className="text-emerald-900 underline underline-offset-4">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-emerald-900 underline underline-offset-4">
              이용약관
            </Link>
          </div>

          <p className="mt-7 text-sm text-slate-500">
            molip.help@gmail.com
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800">Molip Beta</p>
            <p className="mt-1">
              매일의 기록이, 당신을 조금 더 이해하게 합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-slate-900">
              홈
            </Link>
            <Link href="/privacy" className="hover:text-slate-900">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              이용약관
            </Link>
            <Link href="/contact" className="hover:text-slate-900">
              문의
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}