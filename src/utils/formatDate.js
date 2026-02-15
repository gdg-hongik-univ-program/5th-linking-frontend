export const formatDate = (dateString) => {
  if (!dateString) return '생성일 없음';

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return '생성일 없음';

  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  // 오늘이면 시간 표시
  if (isToday) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${strMinutes}`;
  }

  // 올해면 월/일 표시
  if (isThisYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  // 작년 이전이면 년/월/일 표시
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};
