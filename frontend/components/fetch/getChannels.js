export async function getChannels(guildID) {
  const response = await fetch(
    `http://localhost:1112/api/discord/getChannels/${guildID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
