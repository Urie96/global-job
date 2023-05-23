import 'zx/globals';
import { throttle } from 'throttle-typescript';

export const notifyMe = async ({ message = '', title = '' }) => {
    if (message === '') {
        return;
    }
    message = encodeURIComponent(message);
    title = encodeURIComponent(title);
    const url = `https://api.day.app/${process.env.BARK_TOKEN}/${
        title ? `${title}/` : ''
    }${message}`;
    await fetch(url);
};

export const notifyMeWithThrottle = (waitSeconds = 3600) =>
    throttle(notifyMe, waitSeconds * 1000);

const notifyErrTimer = notifyMeWithThrottle(3600);

export const notifyMeErr = (err: string) => {
    notifyErrTimer({ message: err, title: 'MyCronJob报错' });
};
