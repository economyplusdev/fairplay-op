export async function getRealms(guildID) {
  const response = await fetch(
    `http://localhost:1112/api/realms/getRealmList/${guildID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return response.json();
}
