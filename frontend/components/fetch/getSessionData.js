export async function fetchProfileData() {
    const response = await fetch(
      "http://localhost:1112/api/discord/findProfileData",
      {
        method: "GET",
        credentials: "include",
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch profile data, Invalid session cookie");
    }
  
    return response.json();
  }
  