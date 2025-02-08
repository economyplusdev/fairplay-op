export async function getSavedChannels(guildID) {
    const response = await fetch(
      `http://localhost:1112/api/dashboard/getSavedChannels/${guildID}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
  
    return response.json();
  }
  