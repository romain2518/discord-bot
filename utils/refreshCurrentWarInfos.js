import { getCurrentWarInfos, getWarLeagueGroupInfos, getWarLeagueWarInfos } from "./clashOfClansApi.js";
import { displayWarInfo } from "./messageDisplayer.js";
import 'dotenv/config';

export async function refreshCurrentWarInfos(client) {
    let data = await getCurrentWarInfos();

    // If clan members key is undefined, it means the clan is either not in war or in a war league
    if (data.clan.members === undefined) {
        data = await getWarLeagueGroupInfos();
        if (data) { // If data is not False, it means the clan is in a war league
            // Retrieving latest round
            const rounds = data.rounds;
            let latestWarRoundIndex
            rounds.forEach((round, index) => {
                if (round.warTags[0] !== '#0') {
                    latestWarRoundIndex = index;
                }
            });

            // Retrieving war league round
            data = await getWarLeagueWarInfos(rounds[latestWarRoundIndex].warTags[0]); // Data from first war of latest round
            
            let currentRoundsTags;
            if (data.state === 'preparation' && rounds[latestWarRoundIndex-1] !== undefined) { // If latest round has not started yet and the day before has a round
                currentRoundsTags = rounds[latestWarRoundIndex].warTags;
            } else {
                currentRoundsTags = rounds[latestWarRoundIndex-1].warTags;
            }

            // Retrieving war infos 
            let clanTag, opponentTag;
            for (const warTag of currentRoundsTags) { // Using a for of loop in order to be able to use await & break statements
                data = await getWarLeagueWarInfos(warTag);
    
                clanTag = data.clan.tag;
                opponentTag = data.opponent.tag;
                if (clanTag === process.env.CLAN_TAG || opponentTag === process.env.CLAN_TAG) {
                    break;
                }
            }
        }
    }
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