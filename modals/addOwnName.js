import { getMemberList } from "../utils/clashOfClansApi.js";
import { refreshPlayerList } from "../utils/refreshPlayerList.js";

export const modal = {
    name: 'addOwnName',
    async execute(interaction) {
        const sentData = interaction.fields.getTextInputValue('nameOrTag');
        let found = false;
        let memberToAdd;
        const memberList = await getMemberList();

        try {
            memberList.items.forEach(member => {
                if (member.tag === sentData || member.name === sentData) {
                    found = true;
                    memberToAdd = {
                        discordId: interaction.user.id,
                        gamePseudo: member.name,
                        gameTag: member.tag,
                        hasNotifications: true,
                    };
                }
            });
        } catch (error) {
            return interaction.reply({ content: 'Une erreur est survenue, veuillez réessayer plus tard.', ephemeral: true });
        }

        let message;
        if (found) {
            if (await refreshPlayerList(interaction.client, memberToAdd)) {
                message = 'Ta demande a bien été traitée';
            } else {
                message = 'Ton nom figure déjà dans la liste.';
            }
        } else {
            message = 'Tu n\'as pas été trouvé parmi les membres du clan';
        }

        interaction.reply({ content: message, ephemeral: true });
    }
};