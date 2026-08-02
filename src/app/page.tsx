import Link from "next/link";

const experienceItems = [
  "내가 정말 좋아하는 것이 무엇인지 모르겠다.",
  "요즘 무엇을 원하는지 잘 모르겠다.",
  "반복되는 감정과 행동의 이유가 궁금하다.",
  "일상의 기록을 자기이해로 연결하고 싶다.",
];

const discoveryItems = [
  {
    icon: "🌱",
    title: "반복되는 반응",
    description:
      "최근 기록에서 자주 나타나는 관심, 생각, 활동을 발견합니다.",
  },
  {
    icon: "📈",
    title: "변화의 흐름",
    description:
      "같은 대상에 대한 관심과 반응이 어떻게 달라지는지 살펴봅니다.",
  },
  {
    icon: "💡",
    title: "몰입의 신호",
    description:
      "반복해서 관심을 보이고 에너지를 쓰는 곳을 보여줍니다.",
  },
];

const usageSteps = [
  {
    number: "01",
    title: "오늘을 기록합니다",
    description:
      "오늘 있었던 일이나 마음에 남은 순간을 자유롭게 적습니다. 완성된 글이 아니어도 괜찮습니다.",
  },
  {
    number: "02",
    title: "반응을 살펴봅니다",
    description:
      "Molip이 기록 속 관심, 욕구, 부담, 즐거움, 몰입과 같은 반응 신호를 발견합니다.",
  },
  {
    number: "03",
    title: "반복과 변화를 확인합니다",
    description:
      "기록이 쌓이면 반복해서 등장하는 관심과 시간에 따른 반응의 변화를 볼 수 있습니다.",
  },
  {
    number: "04",
    title: "나만의 의미를 발견합니다",
    description:
      "Molip이 보여주는 신호와 질문을 자신의 경험과 연결하며 의미를 살펴봅니다.",
  },
];

const principleItems = [
  {
    title: "기록은 평가의 대상이 아닙니다",
    description:
      "좋은 반응과 나쁜 반응을 나누지 않고 무엇에 어떻게 반응했는지 살펴봅니다.",
  },
  {
    title: "작은 반복을 중요하게 봅니다",
    description:
      "한 번의 강한 감정보다 일상에서 계속 나타나는 관심과 변화를 관찰합니다.",
  },
  {
    title: "해석의 주인은 사용자입니다",
    description:
      "Molip은 신호와 질문을 제공합니다. 그 의미를 판단하고 선택하는 사람은 사용자입니다.",
  },
  {
    title: "사람은 계속 변화합니다",
    description:
      "사용자를 하나의 유형으로 규정하지 않고 시간에 따라 달라지는 흐름을 함께 살펴봅니다.",
  },
];

const useCaseItems = [
  "내가 정말 좋아하는 것이 무엇인지 모르겠을 때",
  "요즘 무엇을 원하는지 잘 모르겠을 때",
  "새로운 일을 찾고 있지만 방향을 정하기 어려울 때",
  "반복되는 감정과 행동의 이유가 궁금할 때",
  "나에게 맞는 몰입 대상을 발견하고 싶을 때",
  "일상의 기록을 자기이해로 연결하고 싶을 때",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fbfcf9] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#fbfcf9]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
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
              href="/app"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 sm:inline-flex"
            >
              로그인
            </Link>

            <Link
              href="/app"
              className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              시작하기
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
            자기이해 기록 서비스
          </p>

          <h1 className="max-w-4xl break-keep text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            당신은 무엇에
            <br />
            반복적으로 반응합니까?
          </h1>

          <p className="mt-8 max-w-2xl break-keep text-lg leading-8 text-slate-600 sm:text-xl">
            매일의 기록에서 반복되는 관심과 변화를 발견하고,
            <br className="hidden sm:block" />
            내가 무엇에 끌리고 몰입하는지 이해해보세요.
          </p>

          <p className="mt-5 max-w-2xl break-keep text-base leading-7 text-slate-500">
            Molip은 매일의 기록에서 반복되는 반응을 발견해,
            <br className="hidden sm:block" />
            사용자가 자신이 무엇에 끌리고 몰입하는지 이해하도록 돕는
            자기이해 서비스입니다.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex min-w-48 items-center justify-center rounded-full bg-slate-900 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-700"
            >
              하루 1분 기록 시작하기
            </Link>

            <a
              href="#about"
              className="inline-flex min-w-48 items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              Molip 알아보기
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            기록을 평가하거나 답을 정해주지 않습니다
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
              하루가 지나면
              <br />
              내 반응도 흩어집니다
            </h2>

            <p className="mt-7 max-w-xl break-keep text-base leading-8 text-slate-600">
              어떤 일에는 유난히 관심이 가고, 어떤 순간에는 에너지가
              생깁니다. 계속 떠오르는 생각이 있는가 하면 반복해서 미루거나
              피하고 싶은 일도 있습니다.
            </p>

            <p className="mt-4 max-w-xl break-keep text-base leading-8 text-slate-600">
              하지만 하루가 지나면 이러한 반응은 쉽게 잊힙니다. 그래서
              내가 무엇을 원하고 무엇에 몰입할 수 있는지 알아차리기
              어렵습니다.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#fbfcf9] p-7 shadow-sm sm:p-9">
            <p className="mb-5 text-sm font-semibold text-slate-500">
              이런 생각을 해본 적이 있나요?
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
              Molip은 흩어지는 반응을
              <br />
              기록하고 연결합니다
            </h2>

            <p className="mt-5 break-keep leading-7 text-slate-600">
              하루의 기록만 요약하는 데서 멈추지 않고,
              <br className="hidden sm:block" />
              기록과 기록 사이에 숨어 있는 반복과 변화를 살펴봅니다.
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

          <p className="mx-auto mt-10 max-w-2xl break-keep text-center text-sm leading-7 text-slate-500">
            하루의 기록은 작지만, 쌓인 기록은 자신을 이해하는 단서가
            됩니다.
          </p>
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              How It Works
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight sm:text-4xl">
              하루 1분이면 충분합니다
            </h2>

            <p className="mt-5 break-keep leading-7 text-slate-300">
              특별한 일이 없어도 괜찮습니다.
              <br className="hidden sm:block" />
              오늘 마음에 남은 순간부터 자유롭게 기록해보세요.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {usageSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <p className="text-sm font-bold text-emerald-300">
                  {step.number}
                </p>

                <h3 className="mt-5 break-keep text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 break-keep text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Principles
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight sm:text-4xl">
              Molip은 답을 정해주지 않습니다
            </h2>

            <p className="mt-5 break-keep leading-7 text-slate-600">
              사용자를 특정 유형으로 분류하거나
              <br className="hidden sm:block" />
              “당신은 이것을 해야 한다”고 결론 내리지 않습니다.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
            {principleItems.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-[#fbfcf9] p-7"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center sm:p-10">
            <p className="break-keep text-xl font-semibold leading-9 text-slate-900">
              “당신은 이런 사람입니다.”
            </p>

            <p className="mt-2 text-base text-slate-500">
              라고 결론을 내리는 대신,
            </p>

            <p className="mt-7 break-keep text-xl font-semibold leading-9 text-emerald-800">
              “이 반응은 당신에게 왜 중요했을까요?”
            </p>

            <p className="mt-5 break-keep text-sm leading-7 text-slate-600">
              Molip은 자신을 다시 바라볼 수 있는 신호와 질문을
              제공합니다. 그 의미를 해석하고 다음을 선택하는 사람은
              사용자입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#fbfcf9] py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              For You
            </p>

            <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight sm:text-4xl">
              이런 순간에 사용할 수 있습니다
            </h2>

            <p className="mt-5 break-keep leading-7 text-slate-600">
              삶의 방향을 크게 바꾸려는 순간뿐 아니라,
              <br className="hidden sm:block" />
              지금의 자신을 조금 더 알고 싶은 순간에도 사용할 수
              있습니다.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
            {useCaseItems.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
                >
                  ✓
                </span>

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-emerald-100 px-7 py-16 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
            Molip Beta
          </p>

          <h2 className="mt-5 break-keep text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            반복되는 반응 속에
            <br />
            아직 발견하지 못한 내가 있습니다
          </h2>

          <p className="mx-auto mt-6 max-w-xl break-keep text-sm leading-7 text-slate-600">
            Molip은 사용자가 자기 자신을 이해하고, 발견하고, 만들어 갈
            수 있도록 돕습니다. 그 이후의 선택은 사용자의 몫입니다.
          </p>

          <p className="mt-7 break-keep text-lg font-bold text-emerald-900">
            당신은 무엇에 반복적으로 반응합니까?
          </p>

          <Link
            href="/app"
            className="mt-9 inline-flex min-w-52 items-center justify-center rounded-full bg-slate-900 px-7 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
          >
            하루 1분 기록 시작하기
          </Link>

          <p className="mt-5 text-xs text-slate-500">
            Google 계정으로 간편하게 시작할 수 있습니다
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800">Molip Beta</p>
            <p className="mt-1">
              매일의 기록이, 당신을 조금 더 이해하게 합니다.
            </p>
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