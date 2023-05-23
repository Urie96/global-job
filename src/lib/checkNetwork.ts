import { createMachine, interpret } from '@xstate/fsm';
import sslChecker from 'ssl-checker';
import { notifyMe, notifyMeWithThrottle } from './notification.js';

const checkHttpServing = async (
    url: URL,
    keyword?: string,
    requestInit?: RequestInit,
) => {
    const attempCount = 1;
    const attempGap = '60s';
    try {
        await retry(attempCount, attempGap, async () => {
            const resp = await fetch(url, requestInit);
            if (resp.status < 200 || resp.status > 299) {
                throw new Error(`status code is ${resp.status}`);
            }
            const respText = await resp.text();
            if (keyword && !respText.includes(keyword)) {
                throw new Error('keyword not found');
            }
        });
        return {
            serving: true,
        };
    } catch (error) {
        console.log(error);
        return {
            serving: false,
            errorMsg: (error as Error).message,
        };
    }
};

interface HttpCheckerParam {
    uniqName: string;
    url: URL;
    keyword?: string;
    notifyThrottleMinSec?: number;
    requestInit?: RequestInit;
}

export const createHttpChecker = (ctx: HttpCheckerParam) => {
    if (ctx.notifyThrottleMinSec) {
        ctx.notifyThrottleMinSec = 3600 * 5;
    }
    let throttleNotify = notifyMeWithThrottle(ctx.notifyThrottleMinSec);

    type ServiceContext = HttpCheckerParam;

    type ServiceEvent = { type: 'FIX' } | { type: 'BREAK'; reason: string };

    type ServiceState =
        | {
              value: 'available';
              context: ServiceContext;
          }
        | {
              value: 'unavailable';
              context: ServiceContext;
          };

    const checker = interpret(
        createMachine<ServiceContext, ServiceEvent, ServiceState>({
            id: ctx.uniqName,
            initial: 'available',
            context: ctx,
            states: {
                available: {
                    entry: () => {
                        throttleNotify = notifyMeWithThrottle(
                            ctx.notifyThrottleMinSec,
                        );
                    },
                    on: {
                        BREAK: {
                            target: 'unavailable',
                            actions: (_, event) => {
                                console.log(`broken at${new Date()}`);
                                throttleNotify({
                                    title: '服务异常',
                                    message: `「${ctx.uniqName}」服务异常: ${
                                        event.type === 'BREAK' && event.reason
                                    } `,
                                });
                            },
                        },
                    },
                },
                unavailable: {
                    entry: () => {},
                    on: {
                        FIX: {
                            target: 'available',
                            actions: (ctx) => {
                                console.log(`fixed at ${new Date()}`);
                                notifyMe({
                                    title: '服务恢复',
                                    message: `「${ctx.uniqName}」服务恢复`,
                                });
                            },
                        },
                    },
                },
            },
        }),
    );
    checker.start();
    const check = async () => {
        const { serving, errorMsg } = await checkHttpServing(
            ctx.url,
            ctx.keyword,
        );
        if (serving) {
            checker.send('FIX');
        } else {
            checker.send({ type: 'BREAK', reason: errorMsg || '' });
        }
    };
    return check;
};

interface checkSSLParam {
    host: string;
    obtain?: () => Promise<unknown>;
    notifyIfDaysLessThan?: number;
}

export const checkSSL = async ({
    host,
    obtain,
    notifyIfDaysLessThan = 7,
}: checkSSLParam) => {
    const res = await sslChecker(host);
    if (res.valid && res.daysRemaining > notifyIfDaysLessThan) {
        console.log(`${host} 证书将在 ${res.daysRemaining} 天后过期`);
    } else {
        if (!res.valid) {
            await notifyMe({
                title: 'SSL证书无效',
                message: `${host} SSL证书无效${
                    obtain ? '，正在尝试自动更新证书' : ''
                }`,
            });
        } else {
            await notifyMe({
                title: 'SSL证书即将过期',
                message: `${host} 证书将在 ${res.daysRemaining} 天后过期${
                    obtain ? '，正在尝试自动更新证书' : ''
                }`,
            });
        }
        if (obtain) {
            // 尝试自动更新证书
            try {
                await obtain();
            } catch (error) {
                const errMsg = (error as Error).message;
                await notifyMe({
                    title: 'SSL证书更新失败',
                    message: `${host} 证书更新失败: ${errMsg}`,
                });
                return;
            }
            await sleep(10000);
            const res = await sslChecker(host);
            if (res.valid) {
                await notifyMe({
                    title: 'SSL证书更新成功',
                    message: `${host} 证书将在 ${res.daysRemaining} 天后过期`,
                });
            } else {
                await notifyMe({
                    title: 'SSL证书更新失败',
                    message: `${host} SSL证书无效`,
                });
            }
        }
    }
};
