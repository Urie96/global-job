import {
  getTodayInfo,
  lunar2solar,
  calculateDaysBetweenDates,
} from './util.js';
import { NotifyFunc } from './notification.js';

interface SpecialDay {
  month: number;
  day: number;
  isLunar: boolean;
  desc: () => string;
  notifyIfDaysLessThan: number;
}

const birthdayDesc = (name: string, birthYear: number) =>
  `${name}的${new Date().getFullYear() - birthYear}岁生日`;

const defaultSpecialDays: SpecialDay[] = [
  {
    month: 5,
    day: 8,
    isLunar: true,
    desc: () => birthdayDesc('胖娃', 1996),
    notifyIfDaysLessThan: 7,
  },
  {
    month: 5,
    day: 7,
    isLunar: true,
    desc: () => birthdayDesc('杨爸', 1973),
    notifyIfDaysLessThan: 7,
  },
  {
    month: 12,
    day: 18,
    isLunar: true,
    desc: () => birthdayDesc('杨妈', 1976),
    notifyIfDaysLessThan: 7,
  },
  {
    month: 6,
    day: 27,
    isLunar: true,
    desc: () => birthdayDesc('悦娃', 1998),
    notifyIfDaysLessThan: 7,
  },
  {
    month: 2,
    day: 26,
    isLunar: true,
    desc: () => birthdayDesc('奶娃', 2023),
    notifyIfDaysLessThan: 7,
  },
  {
    month: 7,
    day: 7,
    isLunar: true,
    desc: () => '七夕节',
    notifyIfDaysLessThan: 7,
  },
  {
    month: 2,
    day: 14,
    isLunar: false,
    desc: () => '情人节',
    notifyIfDaysLessThan: 7,
  },
  {
    month: 5,
    day: 20,
    isLunar: true,
    desc: () => '五二〇',
    notifyIfDaysLessThan: 7,
  },
  {
    month: 10,
    day: 6,
    isLunar: false,
    desc: () => `结婚${new Date().getFullYear() - 2021}周年纪念日`,
    notifyIfDaysLessThan: 7,
  },
  {
    month: 7,
    day: 13,
    isLunar: false,
    desc: () => `在一起${new Date().getFullYear() - 2019}周年纪念日`,
    notifyIfDaysLessThan: 2,
  },
  {
    month: 5,
    day: 8,
    isLunar: false,
    desc: () => `认识${new Date().getFullYear() - 2019}周年纪念日`,
    notifyIfDaysLessThan: 0,
  },
];

export const notifySpecialDays = async (notify: NotifyFunc) => {
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
  defaultSpecialDays.forEach((item) => {
    const target = item.isLunar
      ? lunar2solar(year, item.month, item.day).date
      : new Date(`${year}-${item.month}-${item.day}`);
    const days = calculateDaysBetweenDates(today.date, target);
    const desc = item.desc();
    if (days === 0) {
      textList.push(`今天是${desc}~`);
    } else if (days > 0 && days < item.notifyIfDaysLessThan) {
      textList.push(`离${desc}还有${days}天~`);
    }
    console.log(`离${desc}还有${days}天~`);
  });
  await notify({ title: '节日提醒', message: textList.join('\n') });
};