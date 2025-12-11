/**
 * 将年份代码转换为中文显示名称
 * 例如：07_haru -> 令和7年春
 */
export function formatYearDisplay(yearCode: string): string {
  const [yearNum, season] = yearCode.split('_');
  const year = parseInt(yearNum);

  // 判断是令和年代（01-07）还是平成年代（13-31）
  const isReiwa = year >= 1 && year <= 7;
  const era = isReiwa ? '令和' : '平成';

  // 转换季节
  let seasonText = '';
  if (season === 'haru') {
    seasonText = '春';
  } else if (season === 'aki') {
    seasonText = '秋';
  } else if (season === 'menjo') {
    seasonText = '（免除考试）';
  }

  // 特殊处理：令和元年
  if (year === 1 && isReiwa) {
    return `${era}元年${seasonText}`;
  }

  return `${era}${year}年${seasonText}`;
}
