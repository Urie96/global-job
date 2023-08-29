import { WechatyBuilder, Contact, Message } from 'wechaty';
import { getContactIdByName, saveContactIdByName } from './dal.js';

const bot = WechatyBuilder.build({ name: 'urie' });
bot.on('scan', (qrcode, status) =>
    console.log(
        `Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(
            qrcode,
        )}`,
    ),
)
    .on('logout', (user: Contact) => console.log(`${user.name()} logged out`))
    .on('login', (user: Contact) => console.log(`${user.name()} login`))
    .on('error', (e: Error) => console.error('Bot error:', e))
    .on('ready', () => console.log('wechaty ready'));
// .on('message', onMessage)
// .on('ready', async () => {
//     // @@2310fc1b88184e0810a95e9244fc47b3818d77ccc71371159004d570e81379e9 幸福一家人
//     // @@cbe760d4ff2e78acb287f9c64ce79f7c5a37163f7faf1e05d974f20d3e7fbe84 小分队微信版
//     // @@fe5e4983f6040954b3d92e678d9a783315ad2ed0714cb8f8f8f4ae78f56adafe 人类高质量幼崽早期圈养观察群
//     console.log('ready');
//     // const room = await bot.Room.find({
//     //     id: '@@cbe760d4ff2e78acb287f9c64ce79f7c5a37163f7faf1e05d974f20d3e7fbe84',
//     // });
//     // room?.say('b');
//     // @36aee06e5b4797b0d31f31cbd7a9f2c8c23a6a378fe6a71837230de057cf7e6d ytyt
//     const tmp = await bot.Contact.find({
//         id: '@36aee06e5b4797b0d31f31cbd7a9f2c8c23a6a378fe6a71837230de057cf7e6d',
//     });
//     console.log(tmp);
//     tmp?.say('咋突然就肿了');
// });

try {
    await bot.start();
    console.log('wechaty started');
} catch (e) {
    console.error('Bot start() fail:', e);
    await bot.stop();
    process.exit(-1);
}

export const getContact = async (
    query: Parameters<typeof bot.Contact.find>[0],
) => {
    await bot.ready();
    let idQuery: { id: string } | null = null;
    if (typeof query === 'string') {
        const contactID = await getContactIdByName(query);
        if (contactID) {
            idQuery = { id: contactID };
        }
    }
    const contact = await bot.Contact.find(idQuery ? idQuery : query);
    if (!contact) {
        console.log(`联系人${query}不存在`);
        return;
    }
    if (typeof query === 'string') {
        saveContactIdByName(query, contact.id);
    }
    return contact;
};

async function onMessage(msg: Message) {
    console.info(msg.toString());

    if (msg.self()) {
        console.info('Message discarded because its outgoing');
        return;
    }

    if (msg.age() > 2 * 60) {
        console.info('Message discarded because its TOO OLD(than 2 minutes)');
        return;
    }

    if (
        msg.type() !== bot.Message.Type.Text ||
        !/^(ding|ping|bing|code)$/i.test(msg.text())
    ) {
        console.info(
            'Message discarded because it does not match ding/ping/bing/code',
        );
        return;
    }

    /**
     * 1. reply 'dong'
     */
    await msg.say('dong');
    console.info('REPLY: dong');

    /**
     * 2. reply image(qrcode image)
     */
    // const fileBox = FileBox.fromUrl(
    //     'https://wechaty.github.io/wechaty/images/bot-qr-code.png',
    // );

    // await msg.say(fileBox);
    // console.info('REPLY: %s', fileBox.toString());

    /**
     * 3. reply 'scan now!'
     */
    await msg.say(
        [
            'Join Wechaty Developers Community\n\n',
            'Scan now, because other Wechaty developers want to talk with you too!\n\n',
            '(secret code: wechaty)',
        ].join(''),
    );
}

// const tmp = await getContact('悦悦');
// console.log(tmp);
// tmp?.say('自动提醒：记到喂小奶娃吃伊可新哦～');
