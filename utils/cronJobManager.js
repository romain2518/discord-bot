import { CronJob } from "cron";
import 'dotenv/config';
import { refreshCurrentWarInfos } from "./refreshCurrentWarInfos.js";
import { checkForInactiveAttackers, checkForWarStarts } from "./warEventsChecks.js";

export async function startAutoRefreshCurrentWarInfos(client) {
    const job = new CronJob('00 00 * * * *', () => { refreshCurrentWarInfos(client) }); // Each hour
    job.start();
}

export async function startAutoAlertWarStarts(client) {
    const job = new CronJob('00 01 * * * *', () => { checkForWarStarts(client); }); // Each hour, one minute after current war infos refresh
    job.start();
}

export async function startAutoAlertInactiveAttackers(client) {
    const job = new CronJob('00 01 * * * *', () => { checkForInactiveAttackers(client); }); // Each hour, one minute after current war infos refresh
    job.start();
}