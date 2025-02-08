export async function saveRoles(guildID, roles) {
  const response = await fetch(
    `http://localhost:1112/api/dashboard/saveRoles/${guildID}`,
    {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ roles })
    }
  );
  
  return response.json();
}