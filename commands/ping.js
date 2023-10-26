import { SlashCommandBuilder } from "discord.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Retourne le ping avec le serveur.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        interaction.editReply(`Latence : ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};