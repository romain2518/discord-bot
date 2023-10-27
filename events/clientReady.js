import { Events } from 'discord.js';
import { startAutoRefreshCurrentWarInfos } from '../utils/cronJobManager.js';

export const event = {
    name : Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        //? Starts cron jobs
        startAutoRefreshCurrentWarInfos(client);
    }
};