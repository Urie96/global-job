import { retry } from 'zx/experimental'
import 'zx/globals'
import sslChecker from 'ssl-checker';
import { notify, notifyWithThrottle } from './notification.mjs';

const states = new Map()

export const checkHttpServing = async ({ uniqName, url, requestInit, attempCount = 1, attempGep = '60s', keyword = '', }) => {
    states[uniqName] = states[uniqName] || {
        available: true,
        beingRetry: false,
    }
    const state = states[uniqName]
    if (state.beingRetry) {
        return
    }
    try {
        if (!uniqName || !url) {
            throw new Error('uniqName and url are required')
        }
        state.beingRetry = true
        await retry(attempCount, attempGep, async () => {
            const resp = await fetch(url, requestInit)
            if (resp.status < 200 || resp.status > 299) {
                throw new Error(`status code is ${resp.status}`)
            }
            const respText = await resp.text()
            if (!respText.includes(keyword)) {
                throw new Error('keyword not found')
            }
        })
        if (!state.available) {
            // 从不可用到可用发送通知
            notify({ title: '服务恢复', message: `《${uniqName}》服务恢复` })
        }
        state.available = true
        console.log(`${uniqName} is available`);
    } catch (error) {
        if (state.available) {
            // 从可用到不可用发送通知
            state.notifyWithThrottle = notifyWithThrottle(3600 * 8)
            await state.notifyWithThrottle({ title: '服务异常', message: `《${uniqName}》服务异常: ${error.message} ` })
        } else if (state.notifyUnavailable) {
            // 节流，避免收到太多通知
            await state.notifyWithThrottle({ title: '服务异常', message: `《${uniqName}》服务异常: ${error.message} ` })
        }
        state.available = false
        console.log(`${uniqName} is unavailable, error: ${error.message}`);
    } finally {
        state.beingRetry = false
    }
}

export const checkSSL = async ({ host, notifyIfDaysLessThan = 7, obtain }) => {
    let res = await sslChecker(host);
    if (!res.valid) {
        await notify({ title: 'SSL证书无效', message: `${host} SSL证书无效` })
        if (typeof obtain === 'function') {
            await obtain()
        }
        return
    }
    console.log(`${host} 证书将在 ${res.daysRemaining} 天后过期`);
    if (res.daysRemaining > notifyIfDaysLessThan) {
        return
    }
    if (typeof obtain !== 'function') {
        await notify({ title: 'SSL证书即将过期', message: `${host} 证书将在 ${res.daysRemaining} 天后过期` });
    }
    await notify({ title: 'SSL证书即将过期', message: `${host} 证书将在 ${res.daysRemaining} 天后过期，正在尝试自动更新证书` });
    try {
        await obtain()
    } catch (error) {
        await notify({ title: 'SSL证书更新失败', message: `${host} 证书更新失败: ${error.message}` })
        return
    }
    res = await sslChecker(host);
    if (!res.valid) {
        await notify({ title: 'SSL证书更新失败', message: `${host} SSL证书无效` })
        return
    }
    if (res.daysRemaining <= notifyIfDaysLessThan) {
        await notify({ title: 'SSL证书更新失败', message: `${host} 证书将在 ${res.daysRemaining} 天后过期` })
        return
    }
    await notify({ title: 'SSL证书更新成功', message: `${host} 证书将在 ${res.daysRemaining} 天后过期` })
}

// checkHttpServing({
//     uniqName: 'HackBook-Web',
//     url: 'https://book.lubui.com',
//     keyword: 'HackBook',
// })

// checkSSL({
//     host: 'lubui.com',
//     notifyIfDaysLessThan: 40,
//     obtain: async () => {
//         await $`lego --email lubui.com@gmail.com --dns dnspod --domains \\*.lubui.com --domains lubui.com run`
//         await $`sudo kubectl delete secret tls-lubui.com`
//         await $`sudo kubectl create secret tls tls-lubui.com --cert=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.crt --key=/home/ubuntu/workplace/js/global-job/.lego/certificates/_.lubui.com.key`
//     }
// })
