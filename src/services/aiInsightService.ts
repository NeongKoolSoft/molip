import type { DailyLog } from "@/types/dailyLog";

export const getPatternInsight = (logs: DailyLog[]) => {
  const allText = logs.map((log) => log.content).join(" ");

  const keywords = ["운동", "AI", "개발", "몰입", "걷기", "피곤", "집중"];

  const results = keywords
    .map((keyword) => ({
      keyword,
      count: allText.split(keyword).length - 1,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  if (results.length === 0) {
    return {
      title: "아직 뚜렷한 반복 신호는 없습니다.",
      description:
        "조금 더 기록이 쌓이면 반복되는 관심사와 마음의 변화를 발견할 수 있습니다.",
    };
  }

  const top = results[0];

  return {
    title: `'${top.keyword}'이(가) 최근 기록에서 가장 자주 등장했습니다.`,
    description: `${top.keyword}은(는) 최근 당신이 반복적으로 신경 쓰고 있는 주제일 가능성이 있습니다.`,
  };
};