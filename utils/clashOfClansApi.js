import 'dotenv/config';

export async function getCurrentWarInfos() {
    const config = {
        headers: {Authorization: `Bearer ${process.env.CLASH_OF_CLAN_JWT}`},
    };

    try {
        const response = await fetch(`https://api.clashofclans.com/v1/clans/${encodeURIComponent(process.env.CLAN_TAG)}/currentwar`, config)
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.error('An error occured during the API request : ' + response.status);
        }
    } catch (error) {
        console.error('An error occured during the API request : ' + error.message);
    }
};