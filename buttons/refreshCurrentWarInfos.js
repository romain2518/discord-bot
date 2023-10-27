import { getCurrentWarInfos } from "../utils/clashOfClansApi.js";
import { displayWarInfo } from "../utils/messageDisplayer.js";

export const button = {
    name: 'refreshCurrentWarInfos',
    async execute(interaction) {
        const data = await getCurrentWarInfos();
        const { embedMessages, components } = displayWarInfo(data);

        interaction.update({ embeds: embedMessages, components: components })
    }
};