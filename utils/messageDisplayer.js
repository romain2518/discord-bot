import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import moment from 'moment-timezone';

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

function toValidDate(dateString, state, isEndTime) {
    if (state === 'notInWar') return '-';

    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6)) - 1; // Starts from 0
    const day = parseInt(dateString.slice(6, 8));
    const hours = parseInt(dateString.slice(9, 11));
    const minutes = parseInt(dateString.slice(11, 13));

    const dateObject = moment.tz([year, month, day, hours, minutes], 'UTC');
    const franceTime = dateObject.tz('Europe/Paris');
    if (state === 'preparation' && isEndTime) franceTime.add('1 day');

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
        if (index === 0) formattedString += member;
        else if (index < memberWith0Attack.length -1) formattedString += `, ${member}`;
        else if (index === memberWith0Attack.length -1) formattedString += ` et ${member}`;
    });

    return formattedString === '' ? '-' : formattedString;
}

export function displayWarInfo(data) {
    let embedMessages, components;
    try {
        const firstMessage = new EmbedBuilder()
            .setColor(getColorBasedOnWarState(data.state))
            .setTitle('Info guerre de clan')
            .setDescription(stateTranslations[data.state])
            .addFields(
                {name: 'Début',    value: toValidDate(data.startTime, data.state), inline: true},
                {name: 'Fin',      value: toValidDate(data.endTime, data.state, true), inline: true},
                {name: 'Fin dans', value: getTimeLeft(data.endTime, data.state), inline: true},
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
    
        embedMessages = [firstMessage, secondMessage]
        components = [row];
    
    } catch (error) {
        embedMessages = false;
        components = false;
    }
    return { embedMessages, components };
}