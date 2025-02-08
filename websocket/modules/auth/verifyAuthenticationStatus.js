const axios = require("axios");

async function verifyAuthentication(guildID, realmID, token) {
  const response = await axios.get(
    `http://localhost:1112/api/verifyAuthentication/${guildID}?realmID=${realmID}&token=${token}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

module.exports = verifyAuthentication;