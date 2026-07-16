const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDisplayDate = (date: Date) => {
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

export const formatMonthYear = (date: string) => {
  const [year, month] = date.split("-");
  const monthLabel = months[Number(month) - 1];

  if (!year || !monthLabel) {
    return date;
  }

  return `${monthLabel} ${year}`;
};

export const formatMonthYearRange = (startDate?: string, endDate?: string) => {
  if (!startDate) {
    return undefined;
  }

  const formattedStartDate = formatMonthYear(startDate);
  const formattedEndDate = endDate ? formatMonthYear(endDate) : "present";

  return `${formattedStartDate} — ${formattedEndDate}`;
};