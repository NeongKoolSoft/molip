import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow sm:p-10">
        <p className="text-sm font-semibold text-emerald-700">
          Molip Beta
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          문의
        </h1>

        <p className="mt-6 leading-7 text-slate-600">
          서비스 이용 중 궁금한 점, 오류 제보, 개선 의견이 있다면
          아래 이메일로 연락해 주세요.
        </p>

        <a
          href="mailto:molip.help@gmail.com"
          className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          molip.help@gmail.com
        </a>

        <p className="mt-4 text-sm text-slate-500">
          메일 앱이 열리지 않으면 주소를 복사해 직접 보내 주세요.
        </p>

        <Link
          href="/landing"
          className="mt-10 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Molip로 돌아가기
        </Link>
      </div>
    </main>
  );
}