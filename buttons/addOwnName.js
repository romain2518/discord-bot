import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const button = {
    name: 'addOwnName',
    async execute(interaction) {
        const nameModal = new ModalBuilder()
            .setCustomId('addOwnName')
            .setTitle('Ajouter mon nom à la liste')
        ;

        const input = new TextInputBuilder()
            .setCustomId('nameOrTag')
            .setLabel('Nom ou tag sur Clash of Clans')
            .setMaxLength(100)
            .setStyle(TextInputStyle.Short);
        ;

        const actionRow = new ActionRowBuilder().addComponents(input);

        nameModal.addComponents(actionRow);

        await interaction.showModal(nameModal);
    }
};