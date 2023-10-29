import { refreshPlayerList } from "../utils/refreshPlayerList.js";

export const button = {
    name: 'removeOwnName',
    async execute(interaction) {
        if (!await refreshPlayerList(interaction.client, { discordId: interaction.user.id }, false, true)) {
            return interaction.reply({ content: 'Tu n\'as pas été trouvé parmi les membres enregistrés.', ephemeral: true });
        }
        interaction.reply({ content: 'Ta demande a bien été traitée', ephemeral: true });
    }
};