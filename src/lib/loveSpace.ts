import { notifyMe } from './notification.js';

const safeJsonParse = (str: string) => {
    try {
        return JSON.parse(str);
    } catch (p) {
        console.log(`Error: ${p}, src= ${str}`);
        return null;
    }
};

export const treeSign = async () => {
    const errorTxt = [];
    const successTxt = [];

    {
        const output =
            await $`curl -H 'qqmp-ua: [brand:iPhone][model:iPhone 12 mini<iPhone13,1>][language:zh][os:ios][osv:iOS 16.0][app_ver:8.9.38][cv:4.31]' -H 'Accept: */*' -H 'Accept-Language: zh-CN,zh-Hans;q=0.9' --compressed -H 'Content-Type: application/x-www-form-urlencoded' -H 'cv: 4.31' -H 'User-Agent: QQ/8.9.38.609 CFNetwork/1390 Darwin/22.0.0' -H 'Connection: keep-alive' -H 'Referer: https://appservice.qq.com/1108789561/4.31/page-frame.html' -H 'Cookie: ' -X POST https://qqmp.welove520.com/v1/sweet/miss/sign -d 'lover_open_id=887186D9C02CD5B972F163416660FB43&last_days=1&access_token=703687483468495-8172946c93294a4962'`;
        const res = safeJsonParse(output.stdout);
        if (!res) {
            errorTxt.push(`签到失败: ${output}`);
        } else if (res.error_msg) {
            errorTxt.push(`签到失败: ${res.error_msg}`);
        } else {
            successTxt.push('签到成功');
        }
    }

    {
        const output = await $`curl -s --request POST \
        --url https://tree.welove520.com/v1/game/tree/op \
        --header 'accept-language: zh-CN,zh-Hans;q=0.9' \
        --header 'content-type: application/x-www-form-urlencoded' \
        --header 'host: tree.welove520.com' \
        --header 'origin: https://cdn.welove520.com' \
        --header 'referer: https://cdn.welove520.com/' \
        --header 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) /app/lovespace' \
        --header 'welove-ua: [Device:iPhone13,1][OSV:15.1][CV:3.1.6][WWAN:0][zh_CN][platform:appstore][cocos_version:63]' \
        --data op=1 \
        --data access_token=703687483468495-1185e4de01f00d46e7 \
        --data 'sig=/+Ry21kn+/nsY7ccWaEPkfSwqHk='`;
        const res = safeJsonParse(output.stdout);
        if (!res) {
            errorTxt.push(`浇水失败: ${output}`);
        } else if (res.error_msg) {
            errorTxt.push(`浇水失败: ${res.error_msg}`);
        } else {
            successTxt.push('浇水成功');
        }
    }

    {
        const output = await $`curl -s --request POST \
        --url https://tree.welove520.com/v1/game/tree/op \
        --header 'accept-language: zh-CN,zh-Hans;q=0.9' \
        --header 'content-type: application/x-www-form-urlencoded' \
        --header 'host: tree.welove520.com' \
        --header 'origin: https://cdn.welove520.com' \
        --header 'referer: https://cdn.welove520.com/' \
        --header 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) /app/lovespace' \
        --header 'welove-ua: [Device:iPhone13,1][OSV:15.1][CV:3.1.6][WWAN:0][zh_CN][platform:appstore][cocos_version:63]' \
        --data op=2 \
        --data access_token=703687483468495-1185e4de01f00d46e7 \
        --data sig=Akw3e64u6DzvVzolyky5EWj2ed4=`;
        const res = safeJsonParse(output.stdout);
        if (!res) {
            errorTxt.push(`晒太阳失败: ${output}`);
        } else if (res.error_msg) {
            errorTxt.push(`晒太阳失败: ${res.error_msg}`);
        } else {
            successTxt.push('晒太阳成功');
        }
    }

    if (errorTxt.length) {
        await notifyMe({
            title: '爱情树签到失败',
            message: [...errorTxt, ...successTxt].join('\n'),
        });
    } else {
        await notifyMe({
            title: '爱情树签到成功',
            message: successTxt.join('\n'),
        });
    }
};

export const heartTake = async () => {
    await $`curl --request POST \
    --url https://tree.welove520.com/v1/game/tree/fairyland/hearts/vessel/take \
    --header 'accept: */*' \
    --header 'accept-encoding: gzip, deflate, br' \
    --header 'accept-language: zh-CN,zh-Hans;q=0.9' \
    --header 'connection: keep-alive' \
    --header 'content-type: application/x-www-form-urlencoded' \
    --header 'host: tree.welove520.com' \
    --header 'origin: https://cdn.welove520.com' \
    --header 'referer: https://cdn.welove520.com/' \
    --header 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) /app/lovespace' \
    --header 'welove-ua: [Device:iPhone13,1][OSV:15.1][CV:3.1.6][WWAN:0][zh_CN][platform:appstore][cocos_version:63]' \
    --data type=1 \
    --data by_ad=0 \
    --data scene=fairyland \
    --data access_token=703687483468495-1185e4de01f00d46e7 \
    --data 'sig=ggNni+QZ6Mtmiey9zFGdzKKU5Fk='`;

    await $`curl --request POST \
    --url https://tree.welove520.com/v1/game/tree/fairyland/hearts/vessel/take \
    --header 'accept: */*' \
    --header 'accept-encoding: gzip, deflate, br' \
    --header 'accept-language: zh-CN,zh-Hans;q=0.9' \
    --header 'connection: keep-alive' \
    --header 'content-type: application/x-www-form-urlencoded' \
    --header 'host: tree.welove520.com' \
    --header 'origin: https://cdn.welove520.com' \
    --header 'referer: https://cdn.welove520.com/' \
    --header 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) /app/lovespace' \
    --header 'welove-ua: [Device:iPhone13,1][OSV:15.1][CV:3.1.6][WWAN:0][zh_CN][platform:appstore][cocos_version:63]' \
    --data type=2 \
    --data by_ad=0 \
    --data scene=tree \
    --data access_token=703687483468495-1185e4de01f00d46e7 \
    --data 'sig=/UZgkAWvwmO5oxqQeRG+rcGeF5s='`;
    console.log('收获爱心完成');
};
