import './hookConsoleLog.mjs';
import { scheduleJob } from 'node-schedule';
import { treeSign, heartTake } from './loveSpace.mjs';
import { checkHttpServing, checkSSL } from './checkNetwork.mjs'
import { config } from 'dotenv';
config()

console.log('全局调度任务已启动');

scheduleJob('0 10 10 * * *', treeSign)

scheduleJob('0 0 */3 * * *', heartTake)

scheduleJob('0 10 10 * * *', () => $`cd /home/ubuntu/workplace/py/AutoMihoyoBBS && pipenv run python ./main.py`)

scheduleJob('0 * 11-21 * * *', () => checkHttpServing({
    uniqName: '美好的回忆',
    url: 'http://cro.cab:2342',
    keyword: 'PhotoPrism',
}))

scheduleJob('0 * * * * *', () => checkHttpServing({
    uniqName: '在一起计时',
    url: 'https://huyue.sweetlove.top',
    keyword: 'Love Yue',
}))

scheduleJob('0 * * * * *', () => checkHttpServing({
    uniqName: 'HackBook-Web',
    url: 'https://book.lubui.com',
    keyword: 'HackBook',
}))

scheduleJob('0 * * * * *', () => checkHttpServing({
    uniqName: 'HackBook-Server',
    url: 'https://book.lubui.com/graphql',
    requestInit: {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: '{"query": "{ course(id: \\"G100006501\\") { id } }"}',
    },
    keyword: 'course',
}))

scheduleJob('0 * * * * *', () => checkHttpServing({
    uniqName: 'LUBUI',
    url: 'https://lubui.com',
    keyword: 'LUBUI',
}))

scheduleJob('0 0 10 * * *', () => checkSSL({
    host: 'lubui.com',
    obtain: async () => {
        await $`lego --email lubui.com@gmail.com --dns dnspod --domains \\*.lubui.com --domains lubui.com run`
        await $`sudo kubectl delete secret tls-lubui.com`
        await $`sudo kubectl create secret tls tls-lubui.com --cert=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.crt --key=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.key`
    }
}))

scheduleJob('0 0 10 * * *', () => checkSSL({ host: 'huyue.sweetlove.top' }))

