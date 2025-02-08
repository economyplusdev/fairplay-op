export async function getRoles(guildID) {
  const response = await fetch(
    `http://localhost:1112/api/discord/getRoles/${guildID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
