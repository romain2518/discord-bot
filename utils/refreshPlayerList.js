import { displayPlayerList } from "./messageDisplayer.js";
import 'dotenv/config';

function retrieveMemberList(messageEmbeds) {
    if (messageEmbeds[1] === undefined) return [];
    messageEmbeds.shift();
    
    const regex = /<@(\d+)> : ([^\n]+)\(#(\w+)\), Notifications : (✅|❎)/g;
    let match, discordId, gamePseudo, gameTag, hasNotifications;
    const memberList = [];
    messageEmbeds.forEach(embed => {
        while ((match = regex.exec(embed.description)) !== null) {
            discordId = match[1];
            gamePseudo = match[2];
            gameTag = `#${match[3]}`;
            hasNotifications = match[4] === '✅';
            
            memberList.push({ discordId, gamePseudo, gameTag, hasNotifications });
        }
    });

    return memberList;
}

export async function refreshPlayerList(client, member = null, update = false, remove = false) {
    const channel = client.channels.cache.get(process.env.INFOS_CHANNEL_ID);
    
    if (channel) {
        // Returning the promise value which corresponds to the returned bool of the .then()
        return channel.messages.fetch({ limit: 1 }).then(messages => {
            const lastMessage = messages.first();
            if (lastMessage && lastMessage.author.id === process.env.BOT_ID && lastMessage.embeds[0].data.title.startsWith('Liste des joueurs')) {
                const memberList = retrieveMemberList(lastMessage.embeds);
                // Add, update or remove given member if needed
                if (member) {
                    if (!remove && !update) { // Add member
                        memberList.push(member);
                    } else {
                        let found = false;
                        let memberIndex;
                        memberList.forEach((memberFromList, index) => {
                            if (memberFromList.discordId === member.discordId) {
                                found = true;
                                memberIndex = index;
                            }
                        });

                        if (!found) return false;

                        if (update) { // Update hasNotifications state
                            memberList[memberIndex].hasNotifications = !memberList[memberIndex].hasNotifications;
                        } else { // Delete member
                            memberList.splice(memberIndex);
                        }
                    }
                }

                const { embedMessages, components } = displayPlayerList(memberList);
                if (!embedMessages && !components) return false;

                lastMessage.edit({ embeds: embedMessages, components: components })
                return true;
            } else {
                const { embedMessages, components } = displayPlayerList();
                if (!embedMessages && !components) return false;

                channel.send({ embeds: embedMessages, components: components });
                return true;
            }
        }).catch(error => {
            console.error('An error occurred while retrieving the message:', error);
        });
    } else {
        console.error('Channel not found.');
    }
}