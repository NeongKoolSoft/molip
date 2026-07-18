type LoginFormProps = {
  message: string;
  onGoogleLogin: () => void;
};

export default function LoginForm({
  message,
  onGoogleLogin,
}: LoginFormProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-center text-sm font-medium text-blue-600">
          Molip Beta
        </p>

        <h1 className="mt-2 text-center text-5xl font-bold">
          Molip
        </h1>

        <div className="mt-6 text-center text-gray-600 leading-8">
          <p>당신은 무엇에 반복적으로 반응합니까?</p>
          <p>매일의 기록이, 당신을 조금 더 이해하게 합니다.</p>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.5 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.2 7.5l6.2 5.2C39 37.3 44 31.3 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>

          Google로 시작하기
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}