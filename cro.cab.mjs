import './hookConsoleLog.mjs';
import { scheduleJob } from 'node-schedule';
import 'zx/globals';
import { config } from 'dotenv';
config();

const backup = async (...pathList) => {
    for (const path of pathList) {
        await $([`rclone copy --max-age 26h ${path} ali:`]);
    }
};

scheduleJob('0 3 * * * *', async () => {
    await backup(
        '/home/urie/app/nextcloud/files',
        // '/home/urie/app/photoprism/Pictures',
    );
});
