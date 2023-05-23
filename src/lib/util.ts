import { $ } from 'zx';
import { notifyMeErr } from './notification.js';

export const backup = async (...pathList: string[]) => {
    for (const path of pathList) {
        const { stderr: err } = await $`rclone copy --max-age 26h ${path} ali:`;
        if (err) notifyMeErr(err);
    }
};
