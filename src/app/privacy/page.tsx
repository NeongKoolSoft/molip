export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow">

        <h1 className="text-3xl font-bold mb-8">
          개인정보처리방침
        </h1>

        <p className="text-gray-600 mb-8">
          최종 수정일 : 2026년 7월 20일
        </p>

        <section className="space-y-6">

          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. 수집하는 정보
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>이메일 주소</li>
              <li>사용자가 작성한 기록(Daily Log)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. 이용 목적
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>회원 식별 및 로그인</li>
              <li>AI 분석 서비스 제공</li>
              <li>서비스 개선 및 품질 향상</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. 개인정보의 처리
            </h2>

            <p>
              Molip는 AI 분석을 위해 OpenAI API를 사용할 수 있으며,
              데이터는 Supabase를 통해 안전하게 저장됩니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              4. 보관 기간
            </h2>

            <p>
              개인정보는 회원 탈퇴 또는 삭제 요청 시 지체 없이 삭제합니다.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. 문의
            </h2>

            <p>
              개인정보 관련 문의는 아래 이메일로 연락해 주세요.
            </p>

            <p className="font-semibold mt-2">
              molip.help@gmail.com
            </p>
          </div>

        </section>

        <div className="mt-12 border-t pt-8 text-gray-600">
          Molip은 사용자가 자기 자신을 이해하고,
          발견하고, 만들어 갈 수 있도록 돕습니다.
          이후의 선택은 언제나 사용자의 몫입니다.
        </div>

      </div>
    </main>
  );
}