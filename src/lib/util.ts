import { $ } from 'zx';
import { notifyMeErr } from './notification.js';

export const backup = async (...pathList: string[]) => {
    for (const path of pathList) {
        const { stderr: err } = await $`rclone copy --max-age 26h ${path} ali:`;
        if (err) notifyMeErr(err);
    }
};

interface dayOffsetParam {
    setHour?: number;
    hourOffset?: number;
    dayOffset?: number;
    baseDate?: Date;
}

export const dateOffset = ({
    setHour,
    hourOffset,
    dayOffset = 0,
    baseDate = new Date(),
}: dayOffsetParam) => {
    const p = baseDate ? new Date(baseDate) : new Date();
    if (hourOffset !== undefined) {
        setHour = p.getHours() + hourOffset;
    }
    if (setHour !== undefined) {
        p.setHours(setHour);
    }
    if (dayOffset) {
        p.setDate(p.getDate() + dayOffset);
    }
    return p;
};
