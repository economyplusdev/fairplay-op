export async function saveRealmChannels(guildID, channels, realmID) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/saveRealmChannels/${guildID}?realmID=${realmID}`,
    {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ channels })
    }
  );
  
  return response.json();
}