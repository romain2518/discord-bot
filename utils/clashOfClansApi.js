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

export async function getMemberList() {
    const config = {
        headers: {Authorization: `Bearer ${process.env.CLASH_OF_CLAN_JWT}`},
    };

    try {
        const response = await fetch(`https://api.clashofclans.com/v1/clans/${encodeURIComponent(process.env.CLAN_TAG)}/members`, config)
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

export async function getWarLeagueGroupInfos() {
    const config = {
        headers: {Authorization: `Bearer ${process.env.CLASH_OF_CLAN_JWT}`},
    };

    try {
        const response = await fetch(`https://api.clashofclans.com/v1/clans/${encodeURIComponent(process.env.CLAN_TAG)}/currentwar/leaguegroup`, config)
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.error('An error occured during the API request : ' + response.status);
            return false;
        }
    } catch (error) {
        console.error('An error occured during the API request : ' + error.message);
    }
};

export async function getWarLeagueWarInfos(warTag) {
    const config = {
        headers: {Authorization: `Bearer ${process.env.CLASH_OF_CLAN_JWT}`},
    };

    try {
        const response = await fetch(`https://api.clashofclans.com/v1/clanwarleagues/wars/${encodeURIComponent(warTag)}`, config)
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