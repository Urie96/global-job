import { createClient } from 'redis';
import { notifyMeErr } from './notification.js';

export const redisClient = createClient({
    password: process.env.REDIS_PASSWD,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

export interface HourWeather {
    fxTime: Date;
    temperature: number;
    text: string;
    pop: number;
    precip: number;
}

const genHoursWeatherKey = (location: string, date: Date) =>
    `weather_${location}_${date.getDate()}_${date.getHours()}`;

export const saveHoursWeather = async (
    location: string,
    data: HourWeather[],
) => {
    if (data.length === 0) {
        return;
    }
    try {
        await data
            .reduce((cmd, v) => {
                const key = genHoursWeatherKey(location, v.fxTime);
                const value = JSON.stringify(v);
                console.log(`set ${key} ${value}`);
                return cmd.set(key, value, {
                    EX: 3 * 24 * 3600,
                });
            }, redisClient.multi())
            .exec();
    } catch (error) {
        console.log(error);
        notifyMeErr(error);
    }
};

export const getHourWeather = async (location: string, date: Date) => {
    const val = await redisClient.get(genHoursWeatherKey(location, date));
    if (val) {
        const res = JSON.parse(val) as HourWeather;
        res.fxTime = new Date(res.fxTime); // string转Date
        return res;
    }
};

export const saveContactIdByName = (name: string, id: string) =>
    redisClient.set(`wechat_contact_${name}`, id);

export const getContactIdByName = (name: string) =>
    redisClient.get(`wechat_contact_${name}`);
