export async function joinRealm(guildID, realmID) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/connectToRealm/${guildID}?realmID=${realmID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
