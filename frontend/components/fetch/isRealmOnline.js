export async function isRealmOnline(guildID, realmID) {
  const response = await fetch(
    `http://localhost:1112/api/realms/isFairplayOnline/${guildID}?realmID=${realmID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
