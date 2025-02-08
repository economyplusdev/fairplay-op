export async function getRealmStories(guildID, realmID) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/getRealmStories/${guildID}?realmID=${realmID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
