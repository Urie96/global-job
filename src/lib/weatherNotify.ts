import { notifyMeErr } from './notification.js';
import { HourWeather, getHourWeather, saveHoursWeather } from './dal.js';
import { dateOffset } from './util.js';

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

export const fetchWeatherInfo = async (location: string) => {
    const hoursWeather = await getTodayHoursWeather(location);
    await saveHoursWeather(location, hoursWeather);
};

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

interface TimeRange {
    From: Date;
    To: Date;
}

async function* weatherBetweenTimeRange(location: string, range: TimeRange) {
    for (
        const p = new Date(range.From);
        p < range.To;
        p.setHours(p.getHours() + 1)
    ) {
        const thisHourWeather = await getHourWeather(location, p);
        if (thisHourWeather) {
            yield thisHourWeather;
        }
    }
}

interface WeatherNotifyParam {
    location: string;
    concernedTimeRange?: TimeRange;
    notify: (p: {
        message?: string;
        title?: string;
    }) => Promise<unknown>;
}

const defaultConcernedTimeRange = () => ({
    From: new Date(),
    To: dateOffset({ setHour: 22 }),
});

export const coldNotify = async ({
    location,
    concernedTimeRange = defaultConcernedTimeRange(),
    notify,
}: WeatherNotifyParam) => {
    for await (const thisHourWeather of weatherBetweenTimeRange(
        location,
        concernedTimeRange,
    )) {
        const lastDayWeather = await getHourWeather(
            location,
            dateOffset({ baseDate: thisHourWeather.fxTime, dayOffset: -1 }),
        );
        if (
            lastDayWeather &&
            thisHourWeather.temperature <= lastDayWeather.temperature - 5
        ) {
            notify({
                title: '降温预报',
                message: `${buildTimeText(thisHourWeather.fxTime)}有${
                    thisHourWeather.pop
                }比${buildDateText(lastDayWeather.fxTime)}冷${
                    lastDayWeather.temperature - thisHourWeather.temperature
                }度，记得添衣保暖哦～`,
            });
            break;
        }
    }
};

export const rainNotify = async ({
    location,
    concernedTimeRange = defaultConcernedTimeRange(),
    notify,
}: WeatherNotifyParam) => {
    for await (const thisHourWeather of weatherBetweenTimeRange(
        location,
        concernedTimeRange,
    )) {
        if (thisHourWeather.text.includes('雨')) {
            notify({
                title: '下雨预报',
                message: `${buildTimeText(thisHourWeather.fxTime)}有${
                    thisHourWeather.pop
                }%的概率会有${thisHourWeather.text}，出门记得带伞哦～`,
            });
            break;
        }
    }
};
