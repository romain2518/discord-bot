import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import moment from 'moment-timezone';
import 'dotenv/config'

const colors = {
    'red'   : 0xd63031, // #d63031
    'blue'  : 0x0984e3, // #0984e3
    'green' : 0x2ecc71, // #2ecc71
};

const stateTranslations = {
    'notInWar': 'Pas en guerre',
    'preparation': 'Préparation',
    'inWar': 'En guerre',
    'warEnded':'Guerre terminé',
};

function toValidDate(dateString, state) {
    if (state === 'notInWar') return '-';

    moment.locale('fr');
    
    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6)) - 1; // Starts from 0
    const day = parseInt(dateString.slice(6, 8));
    const hours = parseInt(dateString.slice(9, 11));
    const minutes = parseInt(dateString.slice(11, 13));

    const dateObject = moment.tz([year, month, day, hours, minutes], 'UTC');
    const franceTime = dateObject.tz('Europe/Paris');
    if (state === 'preparation') franceTime.add('1 day');

    const today = moment().startOf('day').tz('Europe/Paris');
    const yesterday = moment(today).subtract(1, 'days');
    const tomorrow = moment(today).add(1, 'days');
    const dayAfterTomorrow = moment(today).add(2, 'days');

    let formattedDate = '';

    if (franceTime.isSame(yesterday, 'd')) {
        formattedDate = 'Hier à ' + franceTime.format('HH:mm');
    } else if (franceTime.isSame(today, 'd')) {
        formattedDate = 'Aujourd\'hui à ' + franceTime.format('HH:mm');
    } else if (franceTime.isSame(tomorrow, 'd')) {
        formattedDate = 'Demain à ' + franceTime.format('HH:mm');
    } else if (franceTime.isSame(dayAfterTomorrow, 'd')) {
        formattedDate = 'Après demain à ' + franceTime.format('HH:mm');
    } else {
        formattedDate = franceTime.format('dddd DD MMM YYYY [à] HH:mm');
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    return formattedDate;
}

function getTimeLeft(dateString, state) {
    if (state === 'warEnded' || state === 'notInWar') return '-';
    
    const format = 'YYYYMMDDTHHmmss.SSSZ'; // ISO dates format
    const date1 = moment();
    const date2 = moment(dateString, format, 'UTC');
    
    const duration = moment.duration(date2.diff(date1));
    const days = state === 'preparation' ? 1 : 0;
    const hours = duration.hours();
    const minutes = duration.minutes();
    
    let formattedDate = '';
    
    if (days === 1) formattedDate += '1 jour et ';
    if (hours === 1) formattedDate += hours + ' heure et ';
    if (hours > 1) formattedDate += hours + ' heures et ';
    if (minutes === 1) formattedDate += minutes + ' minute';
    if (minutes > 1) formattedDate += minutes + ' minutes';

    if (hours === 0 && minutes === 0) formattedDate = '<1 minute';
      
    return formattedDate;
}

function getColorBasedOnWarState(state) {
    if (['inWar', 'enterWar', 'war'].includes(state)) {
        return colors['red'];
    } else if (['preparation', 'inMatchmaking', 'matched'].includes(state)) {
        return colors['green'];
    } else {
        return colors['blue'];
    }
}

function getMembersWith0Attack(memberList) {
    const memberWith0Attack = [];
    memberList.forEach(member => {
        if (member.attacks === undefined) {
            memberWith0Attack.push(member.name);
        }
    });

    let formattedString = '';
    memberWith0Attack.forEach((member, index) => {
        // Using \u00A0 (non breaking spaces) instead of regular spaces in case members use them in there pseudo
        if (index === 0) formattedString += member;
        else if (index < memberWith0Attack.length -1) formattedString += `,\u00A0${member}`;
        else if (index === memberWith0Attack.length -1) formattedString += `\u00A0et\u00A0${member}`;
    });

    return formattedString === '' ? '-' : formattedString;
}

export function displayWarInfo(data) {
    let embedMessages, components;
    try {
        const clan = data.clan.tag === process.env.CLAN_TAG ? data.clan : data.opponent;
        const opponent = data.opponent.tag === process.env.CLAN_TAG ? data.clan : data.opponent;
        const firstMessage = new EmbedBuilder()
            .setColor(getColorBasedOnWarState(data.state))
            .setTitle('Info guerre de clan')
            .setDescription(stateTranslations[data.state])
            .addFields(
                {name: 'Début',    value: toValidDate(data.startTime, data.state), inline: true},
                {name: 'Fin',      value: toValidDate(data.endTime, data.state), inline: true},
                {name: 'Fin dans', value: getTimeLeft(data.endTime, data.state), inline: true},
            )
            .addFields({ name: ' ', value: ' ' })
            .addFields(
                {name: 'Nous',      value: clan.name, inline: true},
                {name: 'Opposant',  value: opponent.name ?? '-', inline: true},
            )
            .addFields({ name: ' ', value: ' ' })
            .addFields(
                {name: (clan.stars ?? '-')     + ' ⭐', value: (clan.destructionPercentage ?? '-')     + '% détruit', inline: true},
                {name: (opponent.stars ?? '-') + ' ⭐', value: (opponent.destructionPercentage ?? '-') + '% détruit', inline: true},
            )
        ;
        
        const secondMessage = new EmbedBuilder()
            .setColor(getColorBasedOnWarState(data.state))
            .setTitle('Membres n\'ayant pas attaqué :')
            .setDescription(getMembersWith0Attack(clan.members))
            .addFields({ name: ' ', value: ' ' })
            .setFooter({ text: 'Dernière mise à jour' })
            .setTimestamp()
        ;
    
        const refreshButton = new ButtonBuilder()
            .setCustomId('refreshCurrentWarInfos')
            .setLabel('Actualiser les informations')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔄')
        ;
        
        const row = new ActionRowBuilder()
            .addComponents(refreshButton)
        ;
    
        embedMessages = [firstMessage, secondMessage]
        components = [row];
    
    } catch (error) {
        embedMessages = false;
        components = false;
    }
    return { embedMessages, components };
}

export function displayPlayerList(memberList = []) {
    let embedMessages = [], components;
    try {
        const embedMessage = new EmbedBuilder()
            .setColor('#40739e')
            .setTitle('Liste des joueurs Clash of Clans répertoriés sur le serveur Discord.')
        ;
    
        embedMessages.push(embedMessage);
    
        let memberEmbedMessage, formattedMemberList, description;
        for (let i = 0; i < Math.ceil(memberList.length/25); i++) {
            memberEmbedMessage = new EmbedBuilder().setColor('#40739e');
            formattedMemberList = memberList.map(member => `<@${member.discordId}> : ${member.gamePseudo}(${member.gameTag}), Notifications : ${member.hasNotifications ? '✅' : '❎'}`);
            description = formattedMemberList.join('\n');
            
            memberEmbedMessage.setDescription(description);
            embedMessages.push(memberEmbedMessage);
        }
        
            
        const addButton = new ButtonBuilder()
            .setCustomId('addOwnName')
            .setLabel('Ajouter mon nom')
            .setStyle(ButtonStyle.Success)
        ;
    
        const deleteButton = new ButtonBuilder()
            .setCustomId('removeOwnName')
            .setLabel('Supprimer mon nom')
            .setStyle(ButtonStyle.Danger)
        ;

        const changeNotificationsReceiptStateButton = new ButtonBuilder()
            .setCustomId('changeNotificationsReceiptState')
            .setLabel('Accepter/Refuser les notifications')
            .setStyle(ButtonStyle.Primary)
        ;
        
        const row = new ActionRowBuilder()
            .addComponents(addButton, deleteButton, changeNotificationsReceiptStateButton)
        ;
        
        components = [row];
    } catch (error) {
        embedMessages = false;
        components = false;
    }

    return { embedMessages, components };
}

export function displayWarStartAlert(client, opponentName) {
    const channel = client.channels.cache.get(process.env.ALERTS_CHANNEL_ID);

    if (!channel) {
        return console.log('Channel not fount.');
    }

    channel.send(`@here La guerre contre ${opponentName} a commencé.`);    
}

export function displayInactiveAttackersAlert(client, opponentName, inactiveAttackers) {
    const channel = client.channels.cache.get(process.env.ALERTS_CHANNEL_ID);

    if (!channel) {
        return console.log('Channel not fount.');
    }

    let formattedString = '';
    inactiveAttackers.forEach((member, index) => {
        if (index === 0) formattedString += `<@${member.discordId}>(${member.gamePseudo})`;
        else if (index < inactiveAttackers.length -1) formattedString += `, <${member.discordId}>(${member.gamePseudo})`;
        else if (index === inactiveAttackers.length -1) formattedString += ` et <${member.discordId}>(${member.gamePseudo})`;
    });

    channel.send(`La guerre contre ${opponentName} se finit bientôt.\nMerci à ${formattedString} d'attaquer (si le niveau des cibles restantes le permet).`);
}