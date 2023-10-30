import { displayWarStartAlert } from "./messageDisplayer.js";
import moment from "moment-timezone";

export function checkForWarStarts(client) {
    const channel = client.channels.cache.get(process.env.INFOS_CHANNEL_ID);
    
    if (channel) {
        channel.messages.fetch({ limit: 10 })
        .then(messages => {
            // Convert the collection to an array ordered from olest message to newest
            return Array.from(messages.values()).reverse();
        }).then(messages => {
            const warInfosMessage = messages[0];
            // Checking if message is the expected one
            if (!warInfosMessage || warInfosMessage.author.id !== process.env.BOT_ID  || !warInfosMessage.embeds[0].data.title.startsWith('Info guerre de clan')) return;
            
            moment.locale('fr');
            const currentMoment = moment();

            // Checking if Clash of Clans API is up
            const lastWarInfosUpdate = moment.tz(warInfosMessage.embeds[1].data.timestamp, 'Europe/Paris');
            if (!lastWarInfosUpdate || currentMoment.diff(lastWarInfosUpdate, 'minutes') > 5) return;

            let warStartDate = warInfosMessage.embeds[0].data.fields[0].value;
            
            // Checking if date is today
            if (!warStartDate.startsWith('Aujourd\'hui')) return;

            // Parsing date
            const today = moment().startOf('day').tz('Europe/Paris');
            const readableDate = today.format('dddd DD MMM YYYY [à]') + warStartDate.slice(-5);
            const parsedDate = moment.tz(readableDate, 'dddd DD MMM YYYY [à] HH:mm', 'Europe/Paris');

            const diffInMinutes = currentMoment.diff(parsedDate, 'minutes');
            
            // If war started less than an hour ago
            if (diffInMinutes >= 0 && diffInMinutes < 60) {
                const opponentName = warInfosMessage.embeds[0].data.fields[5].value;
                displayWarStartAlert(client, opponentName);
            }
        }).catch(error => {
            console.error('An error occurred while retrieving the message:', error);
        });
    } else {
        console.error('Channel not found.');
    }
}