import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getCurrentWarInfos } from "../utils/clashOfClansApi.js";
import { displayWarInfo } from "../utils/messageDisplayer.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName('infos-guerre')
        .setDescription('Donne les informations de la guerre actuelle.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    async execute(interaction) {
        const data = await getCurrentWarInfos();
        const { embedMessages, components } = displayWarInfo(data);
        
        interaction.channel.send({ embeds: embedMessages, components: components });
    },
};