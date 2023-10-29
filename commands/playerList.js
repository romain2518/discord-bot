import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { refreshPlayerList } from "../utils/refreshPlayerList.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName('liste-joueurs')
        .setDescription('Envoie une liste interactive des noms des joueurs Clash of Clans répertoriés sur le serveur Discord')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    async execute(interaction) {
        if (!await refreshPlayerList(interaction.client)) {
            return interaction.reply({ content: 'Une erreur est survenue, veuillez réessayer plus tard.', ephemeral: true });
        }
        interaction.reply({ content: 'Ta demande a bien été traitée', ephemeral: true });
    },
};