import { refreshCurrentWarInfos } from "../utils/refreshCurrentWarInfos.js";

export const button = {
    name: 'refreshCurrentWarInfos',
    async execute(interaction) {
        if (!await refreshCurrentWarInfos(interaction.client)) {
            return interaction.reply({ content: 'Une erreur est survenue, veuillez réessayer plus tard.', ephemeral: true });
        }
        interaction.reply({ content: 'Données actualisées', ephemeral: true });
    }
};