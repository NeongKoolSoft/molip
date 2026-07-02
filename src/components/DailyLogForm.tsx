type DailyLogFormProps = {
  content: string;
  message: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onLogout: () => void;
};

export default function DailyLogForm({
  content,
  message,
  onContentChange,
  onSave,
  onLogout,
}: DailyLogFormProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Molip</h1>

        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          로그아웃
        </button>
      </div>

      <p className="mt-6 text-center text-gray-600 leading-8">
        오늘 무엇이 가장 오래 마음에 남았나요?
        <br />
        <br />
        기억에 남은 일,
        <br />
        계속 생각났던 일,
        <br />
        자꾸 신경 쓰였던 일을
        <br />
        편하게 적어보세요.
      </p>

      <div className="mt-10">
        <label className="font-semibold">오늘의 기록</label>

        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="mt-3 w-full h-48 rounded-xl border border-gray-300 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={onSave}
        className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
      >
        저장
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
      )}
    </>
  );
}