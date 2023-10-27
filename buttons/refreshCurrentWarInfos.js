import { refreshCurrentWarInfos } from "../utils/refreshCurrentWarInfos.js";

export const button = {
    name: 'refreshCurrentWarInfos',
    async execute(interaction) {
        refreshCurrentWarInfos(interaction.client);
        interaction.reply({ content: 'Données actualisées', ephemeral: true });
    }
};