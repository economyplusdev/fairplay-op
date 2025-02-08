"use client";

import { useState, useEffect } from "react";
import { fetchProfileData } from "@/components/fetch/getSessionData";
import ServerCard from "@/components/dashboard/createServerCard";
import NoServersMessage from "@/components/dashboard/noServersMessage";
import ErrorMessage from "@/components/dashboard/errorMessage";
import { GridLoader } from "react-spinners";

export default function Home() {
    const [servers, setServers] = useState([]);
    const [filteredServers, setFilteredServers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setError(null);
            setLoading(true);
            const profileData = await fetchProfileData();
            setServers(profileData.data.guilds);
            setFilteredServers(profileData.data.guilds); // Initialize with the full list
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredServers(
            servers.filter(
                (server) =>
                    server.name.toLowerCase().includes(query) || server.id.includes(query)
            )
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center p-4 sm:p-0">
                    <GridLoader color="rgb(33, 41, 54)" size={10} speedMultiplier={1} />
                </div>
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchData} />
            ) : servers.length === 0 ? (
                <NoServersMessage />
            ) : (
                <div className="text-center">
                    <h1 className="text-white text-4xl mb-8">Select a server</h1>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by ID or name"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full max-w-md p-2 rounded-md shadow-sm focus:ring focus:ring-indigo-300 bg-gray-800/70 text-white placeholder-gray-400 backdrop-blur-md focus:outline-none"
                        />

                    </div>
                    <div className="flex flex-wrap justify-center">
                        {filteredServers.map((guild) => (
                            <ServerCard key={guild.id} guild={guild} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
