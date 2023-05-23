import { createClient } from 'redis';

export const redisClient = createClient();

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

export const saveHoursWeather = (location: string, data: HourWeather[]) => {
    data.reduce(
        (cmd, v) =>
            cmd.set(genHoursWeatherKey(location, v.fxTime), JSON.stringify(v), {
                EX: 3 * 24 * 3600,
            }),
        redisClient.multi(),
    ).exec();
};

export const getHourWeather = async (location: string, date: Date) => {
    const res = await redisClient.get(genHoursWeatherKey(location, date));
    if (res) {
        return JSON.parse(res) as HourWeather;
    }
};
