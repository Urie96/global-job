import 'zx/globals';
import { throttle } from 'throttle-typescript';
// import './wechaty.js';

export type NotifyFunc = (p: {
    message?: string;
    title?: string;
}) => Promise<unknown>;

export const notifyMe: NotifyFunc = async (p) => {
    if (!p.message) {
        return;
    }
    const message = encodeURIComponent(p.message);
    const title = encodeURIComponent(p.title || '');
    const url = `https://api.day.app/${process.env.BARK_TOKEN}/${
        title ? `${title}/` : ''
    }${message}`;
    await fetch(url);
};

interface GotifyMessage {
    message?: string;
    title?: string;
    priority?: number;
}

export const notifyYue: NotifyFunc = (p) =>
    gotify(process.env.YUE_GOTIFY_TOKEN || '', p);

export const gotify = async (token: string, msg: GotifyMessage) => {
    if (!token) {
        notifyMeErr('empty gotify token');
    }
    if (!msg.message) {
        return;
    }
    const url = `https://gotify.home.lubui.com:8443/message?token=${token}`;
    if (msg.priority === undefined) {
        msg.priority = 4;
    }
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(msg),
    });
};

export const notifyMeWithThrottle = (waitSeconds = 3600) =>
    throttle(notifyMe, waitSeconds * 1000);

const notifyErrTimer = notifyMeWithThrottle(3600);

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export const notifyMeErr = (err: any) => {
    let msg = '';
    if (typeof err === 'string') {
        msg = err;
    }
    if (err.message && typeof err.message === 'string') {
        msg = err.message;
    }
    notifyErrTimer({ message: err, title: 'MyCronJob报错' });
};
