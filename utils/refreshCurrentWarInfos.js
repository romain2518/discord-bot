import { getCurrentWarInfos } from "./clashOfClansApi.js";
import { displayWarInfo } from "./messageDisplayer.js";
import 'dotenv/config';

export async function refreshCurrentWarInfos(client) {
    const data = await getCurrentWarInfos();
    const { embedMessages, components } = displayWarInfo(data);
    
    const channel = client.channels.cache.get(process.env.INFOS_CHANNEL_ID);

    if (!embedMessages && !components) return false;
    
    if (channel) {
        channel.messages.fetch({ limit: 10 })
        .then(messages => {
            // Convert the collection to an array ordered from olest message to newest
            return Array.from(messages.values()).reverse();
        }).then(messages => {
            const warInfosMessage = messages[0];
            if (warInfosMessage && warInfosMessage.author.id === process.env.BOT_ID  && warInfosMessage.embeds[0].data.title.startsWith('Info guerre de clan')) {
                warInfosMessage.edit({ embeds: embedMessages, components: components })
            } else {
                channel.send({ embeds: embedMessages, components: components });
            }
        }).catch(error => {
            console.error('An error occurred while retrieving the message:', error);
        });
    } else {
        console.error('Channel not found.');
    }

    return true;
}