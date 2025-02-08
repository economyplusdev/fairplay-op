export async function saveChannels(guildID, channels) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/saveChannels/${guildID}`,
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