import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { refreshCurrentWarInfos } from "../utils/refreshCurrentWarInfos.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName('infos-guerre')
        .setDescription('Donne les informations de la guerre actuelle.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    async execute(interaction) {
        if (!await refreshCurrentWarInfos(interaction.client)) {
            return interaction.reply({ content: 'Une erreur est survenue, veuillez réessayer plus tard.', ephemeral: true });
        }
        interaction.reply({ content: 'Ta demande a bien été traitée', ephemeral: true });
    },
};