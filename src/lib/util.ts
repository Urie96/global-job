import 'zx/globals';
import { notifyMeErr } from './notification.js';
import calendar from 'js-calendar-converter';

export const backup = async (...pathList: string[]) => {
    for (const path of pathList) {
        const { stderr: err } = await $`rclone copy --max-age 26h ${path} ali:`;
        if (err) notifyMeErr(err);
    }
};

interface dayOffsetParam {
    setHour?: number;
    hourOffset?: number;
    dayOffset?: number;
    baseDate?: Date;
}

export const dateOffset = ({
    setHour,
    hourOffset,
    dayOffset = 0,
    baseDate = new Date(),
}: dayOffsetParam) => {
    const p = baseDate ? new Date(baseDate) : new Date();
    if (hourOffset !== undefined) {
        setHour = p.getHours() + hourOffset;
    }
    if (setHour !== undefined) {
        p.setHours(setHour);
    }
    if (dayOffset) {
        p.setDate(p.getDate() + dayOffset);
    }
    return p;
};

interface Calendar {
    date: Date; // "2023-5-1"
    lunarDate: string; // "2023-3-12",
    festival?: string; // "劳动节",
    lunarFestival?: string; // "中秋节"
    lYear: number;
    lMonth: number;
    lDay: number;
    Animal: string; // "兔",
    IMonthCn: string; // "三月",
    IDayCn: string; // "十二",
    cYear: number;
    cMonth: number;
    cDay: number;
    gzYear: string; // "癸卯",
    gzMonth: string; // "丙辰",
    gzDay: string; // "己未",
    isToday: boolean;
    isLeap: boolean;
    nWeek: number;
    ncWeek: string; // "星期一",
    astro: string; // "金牛座"
}

export const lunar2solar = (
    y: number,
    m: number,
    d: number,
    isLeapMonth?: boolean,
) => {
    const res: Calendar = calendar.lunar2solar(y, m, d, isLeapMonth);
    res.date = new Date(res.date);
    return res;
};

export const getTodayInfo = () => {
    const now = new Date();
    const res: Calendar = calendar.solar2lunar(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
    );
    res.date = new Date(res.date);
    return res;
};

export const calculateZeroDateTime = (date = new Date()) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

export const calculateDaysBetweenDates = (date1: Date, date2: Date) => {
    const date1Zero = calculateZeroDateTime(date1).getTime();
    const date2Zero = calculateZeroDateTime(date2).getTime();
    const differenceInDays = (date2Zero - date1Zero) / (1000 * 60 * 60 * 24);
    return differenceInDays;
};
