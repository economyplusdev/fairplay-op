export async function getSessionToken(guildID) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/getSessionToken/${guildID}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const responseJSON = await response.json();
  console.log(responseJSON);
  return responseJSON.session
}
