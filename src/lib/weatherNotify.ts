import { notifyMeErr } from './notification.js';
import { HourWeather, getHourWeather, saveHoursWeather } from './dal.js';

const getTodayHoursWeather = async (
    location: string,
): Promise<HourWeather[]> => {
    const resp = await fetch(
        `https://devapi.qweather.com/v7/weather/24h?key=${process.env.WEATHER_API_KEY}&location=${location}`,
    );
    if (resp.status >= 400) {
        notifyMeErr(await resp.text());
    } else {
        const apiResp: {
            code: number;
            hourly: {
                fxTime: string;
                temp: string;
                text: string; // "多云"
                pop: string; // 降雨概率 "7"
                precip: string; // 降雨量mm "0.0"
            }[];
        } = await resp.json();
        if (apiResp.code >= 400) {
            notifyMeErr(JSON.stringify(apiResp));
        } else {
            const now = new Date();
            return apiResp.hourly.map((v) => ({
                fxTime: new Date(v.fxTime),
                temperature: Number(v.temp),
                text: v.text,
                pop: Number(v.pop),
                precip: Number(v.precip),
            }));
            // .filter((v) => v.fxTime.getDate() === now.getDate());
        }
    }
    return [];
};

const getLastDay = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
};

interface weatherNotifyParam {
    location: string;
    concernedHourRange?: {
        From: number;
        To: number;
    };
    notify: (p: {
        message?: string;
        title?: string;
    }) => Promise<unknown>;
}

export const weatherNotify = async ({
    location,
    concernedHourRange = { From: new Date().getHours(), To: 21 },
    notify,
}: weatherNotifyParam) => {
    const todayWeather = await getTodayHoursWeather(location);
    saveHoursWeather(location, todayWeather);
    const isHourInRange =
        concernedHourRange.From <= concernedHourRange.To
            ? (hour: number) =>
                  hour >= concernedHourRange.From &&
                  hour <= concernedHourRange.To
            : (hour: number) =>
                  hour >= concernedHourRange.From ||
                  hour <= concernedHourRange.To;
    const concernedWeather = todayWeather.filter((v) =>
        isHourInRange(v.fxTime.getHours()),
    );
    const now = new Date();
    const buildDateText = (date: Date) => {
        if (date.getDate() === now.getDate()) {
            return '今天';
        } else if (date.getTime() < now.getTime()) {
            return '昨天';
        } else {
            return '明天';
        }
    };
    const buildTimeText = (date: Date) =>
        `${buildDateText(date)}${date.getHours()}点`;

    for (const hour of concernedWeather) {
        if (hour.pop > 20) {
            notify({
                title: '下雨预报',
                message: `${buildTimeText(hour.fxTime)}有${
                    hour.pop
                }%的概率会下雨，出门记得带伞哦～`,
            });
            break;
        }
    }
    for (const hour of concernedWeather) {
        const lastDay = await getHourWeather(location, getLastDay(hour.fxTime));
        if (lastDay && hour.temperature <= lastDay.temperature - 5) {
            notify({
                title: '降温预报',
                message: `${buildTimeText(hour.fxTime)}有${
                    hour.pop
                }比${buildDateText(lastDay.fxTime)}冷${
                    lastDay.temperature - hour.temperature
                }度，记得添衣保暖哦～`,
            });
            break;
        }
    }
};
