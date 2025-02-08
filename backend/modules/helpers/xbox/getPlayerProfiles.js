const fetch = require("node-fetch");
const refreshXboxToken = require("../../authentication/tokens/refreshXboxToken");

const cache = new Map();
const TTL = 300000;

async function getPlayerProfiles(userIds, guildID, db) {
  const cacheKey = `${guildID}-${userIds.slice().sort().join(",")}`;
  const now = Date.now();
  if (cache.has(cacheKey)) {
    const { expiry, data } = cache.get(cacheKey);
    if (now < expiry) {
      return { data, success: true };
    }
    cache.delete(cacheKey);
  }
  try {
    const xboxToken = await refreshXboxToken(guildID, db);
    const auth = {
      "Authorization": xboxToken.token,
      "x-xbl-contract-version": "2",
      "Accept-Language": "en-US",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": "XboxServicesAPI"
    };
    const body = {
      userIds,
      settings: [
        "AppDisplayName",
        "AppDisplayPicRaw",
        "GameDisplayName",
        "GameDisplayPicRaw",
        "Gamerscore",
        "Gamertag",
        "ModernGamertag",
        "ModernGamertagSuffix",
        "UniqueModernGamertag"
      ]
    };
    const res = await fetch("https://profile.xboxlive.com/users/batch/profile/settings", {
      method: "POST",
      headers: auth,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return { error: `Xbox API responded with status ${res.status}`, success: false };
    }
    const profileData = await res.json();
    const result = { data: profileData.profileUsers, success: true };
    cache.set(cacheKey, { expiry: now + TTL, data: profileData.profileUsers });
    return result;
  } catch (error) {
    return { error: error.message, success: false };
  }
}

module.exports = getPlayerProfiles;
