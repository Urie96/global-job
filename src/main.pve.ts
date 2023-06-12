import 'zx/globals';
import { scheduleJob } from 'node-schedule';
import Koa from 'koa';
import Router from 'koa-router';
import { backup } from './lib/util.js';
import { treeSign, heartTake } from './lib/loveSpace.js';
import { createHttpChecker, checkSSL } from './lib/checkNetwork.js';
import {
    fetchWeatherInfo,
    rainNotify,
    coldNotify,
} from './lib/weatherNotify.js';
import { notifyMe } from './lib/notification.js';
import { notifySpecialDays } from './lib/notifySpecialDays.js';

main();

async function main() {
    scheduleJob('10 10 * * *', treeSign);

    scheduleJob('0 */3 * * *', heartTake);

    scheduleJob('0 3 * * *', async () => {
        await backup(
            // '/home/urie/app/nextcloud/files',
            // '/home/urie/app/photoprism/Pictures',
        );
    });

    {
        // http服务宕机提醒
        const httpCheckList = [
            createHttpChecker({
                uniqName: '美好的回忆',
                url: new URL('http://home.lubui.com:2342'),
                keyword: 'PhotoPrism',
            }),
            createHttpChecker({
                uniqName: '在一起计时',
                url: new URL('https://huyue.sweetlove.top'),
                keyword: 'Love Yue',
            }),
            createHttpChecker({
                uniqName: 'HackBook-Web',
                url: new URL('https://book.lubui.com'),
                keyword: 'HackBook',
            }),
            createHttpChecker({
                uniqName: 'HackBook-Server',
                url: new URL('https://book.lubui.com/api/course/G100104501'),
                keyword: 'eBPF',
            }),
            createHttpChecker({
                uniqName: 'LUBUI',
                url: new URL('https://lubui.com'),
                keyword: '我的笔记',
            }),
        ];
        scheduleJob('* * * * *', async () => {
            for (const check of httpCheckList) {
                await check();
            }
        });
    }

    scheduleJob('0 10 * * *', () =>
        checkSSL({
            host: 'lubui.com',
            obtain: async () => {
                await $`ssh lubui.com DNSPOD_API_KEY=${process.env.DNSPOD_API_KEY} lego --email lubui.com@gmail.com --dns dnspod --domains \\*.lubui.com --domains lubui.com run`;
                await $`ssh lubui.com sudo kubectl delete secret tls-lubui.com`;
                await $`ssh lubui.com sudo kubectl create secret tls tls-lubui.com --cert=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.crt --key=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.key`;
            },
        }),
    );

    {
        // 天气提醒
        const BEIJING = '116.41,39.92';

        scheduleJob('57 * * * *', async () => {
            await fetchWeatherInfo(BEIJING);
        });

        scheduleJob('0 8-21 * * *', () => {
            rainNotify({ location: BEIJING, notify: notifyMe });
        });
        scheduleJob('0 9 * * *', () => {
            coldNotify({ location: BEIJING, notify: notifyMe });
        });
    }

    {
        // 生日提醒
        // scheduleJob('0 8 * * *', () => {
        notifySpecialDays();
        // });
    }

    const router = new Router();
    router
        .get('/win/boot', async (ctx) => {
            await $`wakeonlan -i 192.168.2.255 00:E2:69:62:5B:F7`;
            ctx.body = '已发送魔法包';
        })
        .get('/win/shutdown', async (ctx) => {
            $`ssh urie9@192.168.2.6 shutdown /p`;
            ctx.body = '已调用关机命令';
        });

    const app = new Koa();
    app.use(router.routes())
        .use(router.allowedMethods())
        .listen(process.env.PORT);

    console.log(`全局调度任务已启动，已对${process.env.PORT}端口建立监听`);
}
