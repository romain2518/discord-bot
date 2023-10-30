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

        if (found) {
            await refreshPlayerList(interaction.client, memberToAdd);
        }
        interaction.reply({ content: found ? 'Ta demande a bien été traitée' : 'Tu n\'as pas été trouvé parmi les membres du clan', ephemeral: true });
    }
};