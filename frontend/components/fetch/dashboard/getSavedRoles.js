export async function getSavedRoles(guildID) {
    const response = await fetch(
      `http://localhost:1112/api/dashboard/getSavedRoles/${guildID}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
  
    return response.json();
  }
  