const fetch = require('node-fetch');
const refreshRealmToken = require('../../authentication/tokens/refreshRealmToken');

async function restoreRealmBackup(realmID, backupID, db, guildID) {
  const PocketRealm = await refreshRealmToken(guildID, db);
  const requestData = {
    method: 'PUT',
    headers: {
      'Cache-Control': 'no-cache',
      'Charset': 'utf-8',
      'Client-Version': '1.18.2',
      'User-Agent': 'MCPE/UWP',
      'Accept-Language': 'en-US',
      'Accept-Encoding': 'gzip, deflate, br',
      'Host': 'pocket.realms.minecraft.net',
      'Authorization': PocketRealm.token,
    },
  };

  const url = `https://pocket.realms.minecraft.net/worlds/${realmID}/backups?backupId=${backupID}&clientSupportsRetries=1`;

  const response = await fetch(url, requestData);
  if (!response.ok) {
    return { success: false, error: `Error: ${response.statusText}` };
  }

  return { success: true };
}

module.exports = restoreRealmBackup;
