import { CronJob } from "cron";
import 'dotenv/config';
import { refreshCurrentWarInfos } from "./refreshCurrentWarInfos.js";

export async function startAutoRefreshCurrentWarInfos(client) {
    const job = new CronJob('00 00 * * * *', () => { refreshCurrentWarInfos(client) }); // Each hour
    job.start();
}