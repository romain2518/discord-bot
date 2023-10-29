import { getCurrentWarInfos } from "./clashOfClansApi.js";
import { displayWarInfo } from "./messageDisplayer.js";
import 'dotenv/config';

export async function refreshCurrentWarInfos(client) {
    const data = await getCurrentWarInfos();
    const { embedMessages, components } = displayWarInfo(data);
    
    const channel = client.channels.cache.get(process.env.INFOS_CHANNEL_ID);

    if (!embedMessages && !components) return false;
    
    if (channel) {
        channel.messages.fetch({ limit: 1 }).then(messages => {
            const lastMessage = messages.first();
            if (lastMessage && lastMessage.author.id === process.env.BOT_ID) {
                lastMessage.edit({ embeds: embedMessages, components: components })
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