// Month labels are capitalised even though the rest of the chrome is lowercase:
// a date is a proper noun, and it reads as a date rather than as a label.
// `Sept` keeps four characters — nothing stacks dates into a column, so the
// extra width costs nothing.
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

// Under a year heading the year on each row is noise, so the list drops it.
// getUTC* throughout: a date-only frontmatter string is midnight UTC, and
// reading it locally shifts the day back in any negative-offset zone.
export const formatDayMonth = (date: Date) => {
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
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

// The year rail on a project row. Shortest form that still answers "when":
// an unfinished project stays open, a one-year project shows one year.
export const formatYearRail = (startDate?: string, endDate?: string) => {
  if (!startDate) {
    return undefined;
  }

  const startYear = startDate.slice(0, 4);

  if (!endDate) {
    return `${startYear}—`;
  }

  const endYear = endDate.slice(0, 4);

  return startYear === endYear
    ? startYear
    : `${startYear}–${endYear.slice(2)}`;
};
