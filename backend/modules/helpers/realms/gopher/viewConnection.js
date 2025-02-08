const fetch = require("node-fetch");

async function viewConnection(realmID) {
    const requestData = {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
        },
    };

    try {
        const response = await fetch(`http://localhost:4444/api/lastOutput/${realmID}`, requestData);
        
        if (!response.ok) {
            return { success: false, message: `Error: ${response.status} ${response.statusText}` };
        }

        const data = await response.json(); 
        return { success: true, message: data.output || "No output received" };
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: "Failed to fetch data" };
    }
}

module.exports = viewConnection;
