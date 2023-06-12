import {
    getTodayInfo,
    lunar2solar,
    calculateDaysBetweenDates,
} from './util.js';
import { notifyMe } from './notification.js';

interface SpecialDay {
    month: number;
    day: number;
    isLunar: boolean;
    desc: string;
    notifyIfDaysLessThan: number;
}

const defaultSpecialDays: SpecialDay[] = [
    {
        month: 5,
        day: 8,
        isLunar: true,
        desc: '自己的生日',
        notifyIfDaysLessThan: 7,
    },
    {
        month: 5,
        day: 7,
        isLunar: true,
        desc: '爸爸的生日',
        notifyIfDaysLessThan: 7,
    },
    {
        month: 12,
        day: 18,
        isLunar: true,
        desc: '妈妈的生日',
        notifyIfDaysLessThan: 7,
    },
    {
        month: 6,
        day: 27,
        isLunar: true,
        desc: '悦娃的生日',
        notifyIfDaysLessThan: 7,
    },
    {
        month: 2,
        day: 26,
        isLunar: true,
        desc: '女儿的生日',
        notifyIfDaysLessThan: 7,
    },
];

export const notifySpecialDays = async (specialDays = defaultSpecialDays) => {
    const textList: String[] = [];
    const today = getTodayInfo();
    console.log('today:', today);
    if (today.festival) {
        textList.push(`今天是${today.festival}~`);
    }
    if (today.lunarFestival) {
        textList.push(`今天是${today.lunarFestival}~`);
    }
    const year = new Date().getFullYear();
    specialDays.forEach((item) => {
        const target = item.isLunar
            ? lunar2solar(year, item.month, item.day).date
            : new Date(`${year}-${item.month}-${item.day}`);
        const days = calculateDaysBetweenDates(today.date, target);
        if (days === 0) {
            textList.push(`今天是${item.desc}~`);
        } else if (days > 0 && days < item.notifyIfDaysLessThan) {
            textList.push(`离${item.desc}还有${days}天~`);
        }
        console.log(`离${item.desc}还有${days}天~`);
    });
    await notifyMe({ title: '节日提醒', message: textList.join('\n') });
};
