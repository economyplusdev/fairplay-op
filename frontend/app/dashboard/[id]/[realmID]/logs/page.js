"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GridLoader, ClipLoader } from "react-spinners";
import { getChannels } from "@/components/fetch/getChannels";
import LogDropdown from "@/components/dashboard/cards/createLogDropDown";
import { getRealmChannels } from "@/components/fetch/getRealmChannels";
import { saveRealmChannels } from "@/components/fetch/dashboard/saveRealmChannels";
import Notification from "@/components/dashboard/cards/createNotification";

export default function Home() {
  const { id: guildID, realmID } = useParams();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realmChatSelected, setRealmChatSelected] = useState(null);
  const [botConnectionSelected, setBotConnectionSelected] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (guildID) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const channelsData = await getChannels(guildID);
          if (channelsData.success) {
            setChannels(channelsData.channels);
          } else {
            setError("[FAIRPLAY-INTERNAL] CLIENT SIDE ERROR: " + channelsData.error);
            return;
          }
          const savedData = await getRealmChannels(guildID, realmID);
          if (savedData.success) {
            const savedChannels = savedData.channels?.allChannels || [];
            savedChannels.forEach((channel) => {
              if (channel.type === "realmChat") {
                setRealmChatSelected(channel.channelID);
              } else if (channel.type === "botConnection") {
                setBotConnectionSelected(channel.channelID);
              }
            });
          } else {
            setError("[FAIRPLAY-INTERNAL] CLIENT SIDE ERROR: " + savedData.error);
          }
        } catch (e) {
          console.error(e);
          setError("An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [guildID]);

  const handleSave = () => {
    setIsSaving(true);
    const channelMappings = [
      { type: "realmChat", channelID: realmChatSelected },
      { type: "botConnection", channelID: botConnectionSelected }
    ];
    const payload = {
      allChannels: channelMappings.filter(mapping => mapping.channelID !== null)
    };
    saveRealmChannels(guildID, payload, realmID)
      .then((data) => {
        if (data.success) {
          setNotification({ message: "Settings saved successfully!", type: "success" });
        } else {
          setNotification({ message: "Failed to save settings.", type: "error" });
        }
      })
      .catch(() => {
        setNotification({ message: "An error occurred while saving settings.", type: "error" });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleReset = () => {
    setRealmChatSelected(null);
    setBotConnectionSelected(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GridLoader color="#212936" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-6 pt-10">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        <LogDropdown
          title="Realm Chat"
          description="Select a channel for Realm Chat."
          channels={channels}
          selected={realmChatSelected}
          setSelected={setRealmChatSelected}
        />
        <LogDropdown
          title="Bot Connection Updates"
          description="Select a channel for Bot Connection Updates."
          channels={channels}
          selected={botConnectionSelected}
          setSelected={setBotConnectionSelected}
        />
      </div>
      <div className="flex flex-wrap justify-center space-x-4 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSaving ? <ClipLoader size={20} color="#ffffff" /> : "Save"}
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
