type LoginFormProps = {
  email: string;
  password: string;
  message: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignUp: () => void;
  onLogin: () => void;
};

export default function LoginForm({
  email,
  password,
  message,
  onEmailChange,
  onPasswordChange,
  onSignUp,
  onLogin,
}: LoginFormProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-5xl font-bold text-center">Molip</h1>

        <p className="mt-6 text-center text-gray-600 leading-8">
          오늘 무엇이 가장 오래 마음에 남았나요?
        </p>

        <div className="mt-10 space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onSignUp}
            className="w-full rounded-xl bg-gray-800 py-3 text-white font-semibold"
          >
            회원가입
          </button>

          <button
            onClick={onLogin}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold"
          >
            로그인
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </main>
  );
}