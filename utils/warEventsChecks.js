import { displayInactiveAttackersAlert, displayWarStartAlert } from "./messageDisplayer.js";
import { retrieveMemberList } from "./refreshPlayerList.js";
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

export function checkForInactiveAttackers(client) {
    const channel = client.channels.cache.get(process.env.INFOS_CHANNEL_ID);
    
    if (channel) {
        channel.messages.fetch({ limit: 10 })
        .then(messages => {
            // Convert the collection to an array ordered from olest message to newest
            return Array.from(messages.values()).reverse();
        }).then(messages => {
            const warInfosMessage = messages[0];
            const playerListMessage = messages[1];
            
            // Checking if messages are the expected one
            if (!warInfosMessage || warInfosMessage.author.id !== process.env.BOT_ID  || !warInfosMessage.embeds[0].data.title.startsWith('Info guerre de clan')) return;
            if (!playerListMessage || playerListMessage.author.id !== process.env.BOT_ID  || !playerListMessage.embeds[0].data.title.startsWith('Liste des joueurs')) return;
            
            // If the maximum score has already been reached 9
            if (warInfosMessage.embeds[0].data.fields[8].value === '100% détruit') return;
            
            moment.locale('fr');
            const currentMoment = moment();
            
            // Checking if it is nighttime (from 9pm (21h) to 7am (7h))
            if (currentMoment.hour() > 21 || currentMoment.hour() < 7) return;
            
            // Checking if Clash of Clans API is up
            const lastWarInfosUpdate = moment.tz(warInfosMessage.embeds[1].data.timestamp, 'Europe/Paris');
            if (!lastWarInfosUpdate || currentMoment.diff(lastWarInfosUpdate, 'minutes') > 5) return;
            
            let warEndDate = warInfosMessage.embeds[0].data.fields[1].value;
            
            // Checking if date is today or tomorrow
            if (!warEndDate.startsWith('Aujourd\'hui') && !warEndDate.startsWith('Demain')) return;
            
            const isWarEndingToday = warEndDate.startsWith('Aujourd\'hui');
            
            // Parsing date
            const today = moment().startOf('day').tz('Europe/Paris');
            const tomorrow = moment(today).add(1, 'days');
            
            const readableDate = (isWarEndingToday ? today : tomorrow).format('dddd DD MMM YYYY [à]') + warEndDate.slice(-5);
            const parsedDate = moment.tz(readableDate, 'dddd DD MMM YYYY [à] HH:mm', 'Europe/Paris');
            
            const diffInHours = currentMoment.diff(parsedDate, 'hours');
            
            // If war ends in 3 hours but more than 2 hours in order to not send only one message
            const diff3Hours = diffInHours === -3;
            // OR if it is 7am (7:01*) and war ends at 10:00
            //      since it will ends in less than 3 hours but not before 10am (condition for wars ending at nighttime)
            //*     Every check occurs one minute after the begin of the hour
            const is7AmAndWarEndsAt10 = currentMoment.hour() === 7 && parsedDate.hour() === 10;
            
            // OR If it is 9pm (21h) and war ends TOMORROW before 10am (10h)
            const is9PmAndWarEndsTomorrowBefore10Am = !isWarEndingToday && currentMoment.hour() === 21 && parsedDate.hour() < 10;
            
            if (diff3Hours || is7AmAndWarEndsAt10 || is9PmAndWarEndsTomorrowBefore10Am) {
                const inactiveAttackersString = warInfosMessage.embeds[1].data.description;
                
                // If description is empty
                if (inactiveAttackersString === '-') return;
                
                const inactiveAttackersArray = inactiveAttackersString.split(',\u00A0');
                const last2InactiveAttackersString = inactiveAttackersArray.splice(-1)[0];
                const last2InactiveAttackersArray = last2InactiveAttackersString.split('\u00A0et\u00A0');
                if (last2InactiveAttackersArray[0]) inactiveAttackersArray.push(last2InactiveAttackersArray[0]);
                if (last2InactiveAttackersArray[1]) inactiveAttackersArray.push(last2InactiveAttackersArray[1]);
                
                const memberList = retrieveMemberList(playerListMessage.embeds);
                
                // If memberList is empty
                if (!memberList[0]) return;
                
                // Finding discord id of inactive attackers with notifications enabled
                const inactiveAttackersToPing = [];
                memberList.forEach(member => {
                    if (inactiveAttackersArray.includes(member.gamePseudo) && member.hasNotifications) {
                        inactiveAttackersToPing.push(member);
                    }
                });
                
                // If there is nobody to ping
                if (!inactiveAttackersToPing[0]) return;

                const opponentName = warInfosMessage.embeds[0].data.fields[5].value;
                displayInactiveAttackersAlert(client, opponentName, inactiveAttackersToPing);
            }
        }).catch(error => {
            console.error('An error occurred while retrieving the message:', error);
        });
    } else {
        console.error('Channel not found.');
    }
}