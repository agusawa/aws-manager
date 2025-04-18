import day from "dayjs";
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';

day.extend(localizedFormat);
day.extend(utc);
day.extend(timezone);
day.extend(advancedFormat);

export { day };
