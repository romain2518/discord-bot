import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { refreshCurrentWarInfos } from "../utils/refreshCurrentWarInfos.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName('infos-guerre')
        .setDescription('Donne les informations de la guerre actuelle.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    async execute(interaction) {
        refreshCurrentWarInfos(interaction.client);
        interaction.reply({ content: 'Ta demande a bien été traitée', ephemeral: true });
    },
};