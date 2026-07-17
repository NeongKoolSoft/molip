import Link from "next/link";

const discoveryItems = [
  {
    icon: "🌱",
    title: "반복되는 반응",
    description:
      "최근 기록에서 자주 나타나는 대상과 생각을 발견합니다.",
  },
  {
    icon: "📈",
    title: "변화의 흐름",
    description:
      "같은 대상에 대한 관심과 감정이 어떻게 달라지는지 살펴봅니다.",
  },
  {
    icon: "💡",
    title: "몰입의 신호",
    description:
      "당신이 반복해서 에너지를 쓰고 있는 곳을 보여줍니다.",
  },
];

const experienceItems = [
  "같은 고민을 반복하는 것 같다.",
  "왜 어떤 생각은 계속 머릿속에 남는지 궁금하다.",
  "평범한 하루 속에서도 나를 움직인 것이 무엇인지 알고 싶다.",
  "기록을 통해 나 자신을 조금 더 이해하고 싶다.",
];

const usageSteps = [
  {
    number: "01",
    title: "하루를 기록합니다",
    description:
      "특별한 일이 없어도 괜찮습니다. 오늘 기억에 남은 생각과 반응을 자유롭게 적어보세요.",
  },
  {
    number: "02",
    title: "AI가 흐름을 발견합니다",
    description:
      "최근 기록을 연결해 반복되는 반응과 생각의 변화를 분석합니다.",
  },
  {
    number: "03",
    title: "나의 패턴을 이해합니다",
    description:
      "시간이 쌓일수록 내가 무엇에 끌리고, 무엇을 중요하게 여기는지 보이기 시작합니다.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fbfcf9] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#fbfcf9]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/landing"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span aria-hidden="true">🌱</span>
            <span>Molip</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Beta
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 sm:inline-flex"
            >
              로그인
            </Link>

            <Link
              href="/"
              className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Beta 시작하기
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl"
        />

        <div className="relative mx-auto flex min-h-[760px] w-full max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="mb-6 inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            AI 기반 자기이해 서비스
          </p>

          <h1 className="max-w-4xl break-keep text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            당신은 무엇에
            <br />
            반복적으로 반응합니까?
          </h1>

          <p className="mt-8 max-w-2xl break-keep text-lg leading-8 text-slate-600 sm:text-xl">
            매일의 기록이,
            <br className="sm:hidden" /> 당신을 조금 더 이해하게 합니다.
          </p>

          <p className="mt-5 max-w-2xl break-keep text-base leading-7 text-slate-500">
            Molip은 당신의 기록 속에서 반복되는 반응과 생각의 흐름,
            그리고 몰입의 신호를 발견하도록 돕습니다.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-w-48 items-center justify-center rounded-full bg-slate-900 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-700"
            >
              Beta 시작하기
            </Link>

            <a
              href="#about"
              className="inline-flex min-w-48 items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              Molip 알아보기
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            하루 1분 기록 · AI 분석 · 반복 반응 발견
          </p>
        </div>
      </section>

      <section
        id="about"
        className="border-y border-slate-200 bg-white py-24"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Why Molip
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              우리는 매일을 살아가지만,
              <br />
              무엇이 나를 움직였는지는
              <br />
              쉽게 놓칩니다.
            </h2>

            <p className="mt-7 max-w-xl break-keep text-base leading-8 text-slate-600">
              Molip은 하루를 평가하거나 당신을 단정하지 않습니다.
              기록 속에서 반복되는 대상과 반응을 찾아, 스스로를 이해할
              수 있는 단서를 보여줍니다.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#fbfcf9] p-7 shadow-sm sm:p-9">
            <p className="mb-5 text-sm font-semibold text-slate-500">
              당신도 이런 경험이 있나요?
            </p>

            <ul className="space-y-4">
              {experienceItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Discovery
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight sm:text-4xl">
              Molip이 발견하는 것
            </h2>

            <p className="mt-5 break-keep leading-7 text-slate-600">
              단순히 오늘의 기록을 요약하는 데서 멈추지 않고,
              기록과 기록 사이에 숨어 있는 흐름을 살펴봅니다.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {discoveryItems.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl" aria-hidden="true">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>

                <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              How it works
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight sm:text-4xl">
              하루의 기록에서
              <br />
              나만의 패턴까지
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {usageSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <p className="text-sm font-bold text-emerald-300">
                  {step.number}
                </p>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-4 break-keep text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Reflection
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Molip은 당신을
              <br />
              단정하지 않습니다.
            </h2>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 sm:p-10">
            <p className="break-keep text-xl font-semibold leading-9 text-slate-900">
              “당신은 이런 사람입니다.”
            </p>

            <p className="mt-2 text-base text-slate-500">
              라고 결론을 내리는 대신,
            </p>

            <p className="mt-8 break-keep text-xl font-semibold leading-9 text-emerald-800">
              “이 반응은 당신에게 왜 중요했을까요?”
            </p>

            <p className="mt-5 break-keep text-sm leading-7 text-slate-600">
              Molip은 답을 대신 정하지 않습니다. 자기 이해의 최종적인
              해석과 선택은 언제나 사용자의 몫입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-emerald-100 px-7 py-16 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
            Molip Beta
          </p>

          <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            오늘의 기록에서
            <br />
            나를 이해하는 첫걸음을 시작하세요.
          </h2>

          <p className="mx-auto mt-6 max-w-xl break-keep text-sm leading-7 text-slate-600">
            Molip은 현재 Beta 버전입니다. 실제 사용 경험을 바탕으로
            조금씩 개선하고 있습니다.
          </p>

          <Link
            href="/"
            className="mt-9 inline-flex min-w-52 items-center justify-center rounded-full bg-slate-900 px-7 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
          >
            Beta 시작하기
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800">Molip Beta</p>
            <p className="mt-1">매일의 기록이, 당신을 조금 더 이해하게 합니다.</p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
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