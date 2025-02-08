export async function getRealmChannels(guildID, realmID) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/getSavedRealmChannels/${guildID}?realmID=${realmID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
