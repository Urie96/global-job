import 'zx/globals';

export const notify = async ({ message, title }) => {
    message = encodeURIComponent(message || '');
    title = encodeURIComponent(title || '');
    const url = `https://api.day.app/${process.env['BARK_TOKEN']}/${
        title ? `${title}/` : ''
    }${message}`;
    await fetch(url);
};

function throttle(fn, wait) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall < wait * 1000) {
            return;
        }
        lastCall = now;
        return fn.apply(this, ...args);
    };
}

export const notifyWithThrottle = (wait = 0) => throttle(notify, wait);
