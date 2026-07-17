export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow">

        <h1 className="text-3xl font-bold mb-8">
          이용약관
        </h1>

        <p className="text-gray-600 mb-8">
          최종 수정일 : 2026년 7월 20일
        </p>

        <section className="space-y-6">

          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. 서비스 소개
            </h2>

            <p>
              Molip은 AI를 활용하여 사용자가 자신의 기록을
              이해할 수 있도록 돕는 자기이해 서비스입니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. Beta 서비스
            </h2>

            <p>
              현재 Molip은 Beta 버전입니다.
              기능은 예고 없이 변경되거나 개선될 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. AI 분석
            </h2>

            <p>
              AI 분석 결과는 참고용이며,
              최종적인 판단과 선택은 사용자에게 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              4. 금지 사항
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>타인의 개인정보 입력</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>불법적인 목적의 이용</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. 문의
            </h2>

            <p className="font-semibold">
              molip.help@gmail.com
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}