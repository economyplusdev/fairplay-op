const axios = require("axios");

async function getMemberList(realmID) {
  const response = await axios.get(
    `http://localhost:1112/api/fairplay/setMemberlist/${realmID}`,
    {
      withCredentials: true,
    }
  );
  return response.data.list;
}

module.exports = getMemberList;