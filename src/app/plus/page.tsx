import Link from "next/link";

const plusFeatures = [
  {
    title: "이번 주의 흐름을 한눈에",
    description:
      "최근 기록에서 이어진 반응과 생각을 하나의 흐름으로 연결합니다.",
  },
  {
    title: "가장 오래 남은 반응 발견",
    description:
      "최근 7일 동안 자주 나타난 관심과 몰입의 흐름을 보여줍니다.",
  },
  {
    title: "의미가 달라진 순간",
    description:
      "같은 활동이나 대상에 새롭게 더해진 이유와 의미를 발견합니다.",
  },
  {
    title: "이번 주를 다시 바라보는 질문",
    description:
      "이번 주의 기록을 한 번 더 바라볼 수 있는 질문을 제공합니다.",
  },
];

export default function PlusPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-7 sm:p-9">
        <p className="text-sm font-semibold text-indigo-700">
          Molip Plus
        </p>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          당신의 기록을 하루가 아닌
          <br />
          흐름으로 연결합니다.
        </h1>

        <p className="mt-6 leading-8 text-gray-700">
          Molip Plus는 하루의 기록을 넘어 최근 7일 동안
          반복된 반응과 의미의 변화를 하나의 흐름으로
          연결해 보여줍니다.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Plus에서 경험하는 흐름
        </h2>

        <div className="mt-5 space-y-4">
          {plusFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <h3 className="font-bold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          앞으로 확장될 흐름
        </h2>

        <ul className="mt-4 space-y-3 text-gray-700">
          <li>최근 30일의 변화</li>
          <li>월간 리포트</li>
          <li>장기 Life Pattern</li>
          <li>사용자에게 맞춰지는 질문 경험</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          더 많은 AI가 아니라, 더 긴 시간의 이해
        </h2>

        <p className="mt-3 leading-7 text-gray-700">
          Molip Plus는 기능을 더 많이 제공하는 것에 그치지
          않습니다. 시간이 지나며 이어지는 반응과 생각을 통해
          사용자가 자신을 더 깊이 이해하도록 돕습니다.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Beta 안내
        </h2>

        <p className="mt-3 leading-7 text-gray-700">
          Molip Plus는 현재 Beta 기간 동안 실제 기록을 바탕으로
          기능과 표현을 계속 다듬고 있습니다.
        </p>
      </section>

      <div className="mt-10">
        <Link
          href="/app"
          className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700"
        >
          Molip로 돌아가기
        </Link>
      </div>
    </main>
  );
}