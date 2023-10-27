import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import moment from 'moment-timezone';

const colors = {
    'red'   : 0xd63031, // #d63031
    'blue'  : 0x0984e3, // #0984e3
    'green' : 0x2ecc71, // #2ecc71
};

const stateTranslations = {
    'clanNotFound': 'Clan introuvable',
    'accessDenied': 'Accès refusé',
    'notInWar': 'Pas en guerre',
    'inMatchmaking': 'En recherche de guerre',
    'enterWar': 'Entrée en guerre',
    'matched': 'Opposant trouvé',
    'preparation': 'Préparation',
    'war': 'Guerre',
    'inWar': 'En guerre',
    'ended':'Guerre terminé',
};

function toValidDate(dateString) {
    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6)) - 1; // Starts from 0
    const day = parseInt(dateString.slice(6, 8));
    const hours = parseInt(dateString.slice(9, 11));
    const minutes = parseInt(dateString.slice(11, 13));

    const dateObject = moment.tz([year, month, day, hours, minutes], 'UTC');
    const franceTime = dateObject.tz('Europe/Paris');
    const today = moment().startOf('day').tz('Europe/Paris');
    const yesterday = moment(today).subtract(1, 'days');
    const tomorrow = moment(today).add(1, 'days');

    let formattedDate = '';

    if (franceTime.isSame(yesterday, 'd')) {
        formattedDate = 'Hier à ' + franceTime.format('HH:mm');
    } else if (franceTime.isSame(today, 'd')) {
        formattedDate = 'Aujourd\'hui à ' + franceTime.format('HH:mm');
    } else if (franceTime.isSame(tomorrow, 'd')) {
        formattedDate = 'Demain à ' + franceTime.format('HH:mm');
    } else {
        formattedDate = franceTime.format('dddd DD MMM YYYY [à] HH:mm');
    }

    return formattedDate;
}

function timeLeftInHoursAndMinutes(dateString) {
    const format = 'YYYYMMDDTHHmmss.SSSZ'; // Format des dates ISO
    const date1 = moment();
    const date2 = moment(dateString, format, 'UTC');
  
    const duration = moment.duration(date2.diff(date1));
    const hours = duration.hours();
    const minutes = duration.minutes();

    let formattedDate = '';
    
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
        if (member.opponentAttacks === 0) {
            memberWith0Attack.push(member.name);
        }
    });

    let formattedString = '';
    memberWith0Attack.forEach((member, index) => {
        if (index === 0) formattedString += member;
        else if (index < memberWith0Attack.length -1) formattedString += `, ${member}`;
        else if (index === memberWith0Attack.length -1) formattedString += ` et ${member}`;
    });

    return formattedString === '' ? '-' : formattedString;
}

export function displayWarInfo(data) {
    const firstMessage = new EmbedBuilder()
        .setColor(getColorBasedOnWarState(data.state))
        .setTitle('Info guerre de clan')
        .setDescription(stateTranslations[data.state])
        .addFields(
            {name: 'Début',    value: toValidDate(data.startTime), inline: true},
            {name: 'Fin',      value: toValidDate(data.endTime), inline: true},
            {name: 'Fin dans', value: timeLeftInHoursAndMinutes(data.endTime), inline: true},
        )
        .addFields({ name: ' ', value: ' ' })
        .addFields(
            {name: 'Nous',      value: data.clan.name, inline: true},
            {name: 'Opposant',  value: data.opponent.name ?? '-', inline: true},
        )
        .addFields({ name: ' ', value: ' ' })
        .addFields(
            {name: (data.clan.stars ?? '-')     + ' ⭐', value: (data.clan.destructionPercentage ?? '-')     + '% détruit', inline: true},
            {name: (data.opponent.stars ?? '-') + ' ⭐', value: (data.opponent.destructionPercentage ?? '-') + '% détruit', inline: true},
        )
    ;
    
    const secondMessage = new EmbedBuilder()
        .setColor(getColorBasedOnWarState(data.state))
        .setTitle('Membres n\'ayant pas attaqué :')
        .setDescription(getMembersWith0Attack(data.clan.members))
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

    const embedMessages = [firstMessage, secondMessage]
    const components = [row];

    return { embedMessages, components };
}