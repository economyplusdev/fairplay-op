const axios = require('axios');

async function fetchAutoCompletions(guildID, searchName, searchValue) {
    
    try {
        const response = await axios.post(
            `http://localhost:1112/api/discordbot/fetchAutoComplete/${guildID}?catagory=${searchName}`,
            {
                searchValue: searchValue,
            },
            {
                headers: {
                    Authorization: process.env.BACKEND_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { autoCompletions: response.data.autoCompletions, error: false };


    } catch (error) {
        console.error(error);
        return { autoCompletions: [], error: [], status: [], error: true };
    }

}

module.exports = fetchAutoCompletions;
