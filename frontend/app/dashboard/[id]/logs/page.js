// Home.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GridLoader, ClipLoader } from "react-spinners";
import { getChannels } from "@/components/fetch/getChannels";
import LogDropdown from "@/components/dashboard/cards/createLogDropDown";
import { getSavedChannels } from "@/components/fetch/dashboard/getSavedChannels";
import { saveChannels } from "@/components/fetch/dashboard/saveChannels";
import Notification from "@/components/dashboard/cards/createNotification";
export default function Home() {
  const { id: guildID } = useParams();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [banUnbanSelected, setBanUnbanSelected] = useState(null);
  const [closeOpenSelected, setCloseOpenSelected] = useState(null);
  const [backupSelected, setBackupSelected] = useState(null);
  const [permissionsSelected, setPermissionsSelected] = useState(null);
  const [realmCodeSelected, setRealmCodeSelected] = useState(null);

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

          const savedData = await getSavedChannels(guildID);
          if (savedData.success) {
            const savedChannels = savedData.channels?.allChannels || [];
            savedChannels.forEach((channel) => {
              switch (channel.type) {
                case "ban/unban":
                  setBanUnbanSelected(channel.channelID);
                  break;
                case "close/open":
                  setCloseOpenSelected(channel.channelID);
                  break;
                case "backup":
                  setBackupSelected(channel.channelID);
                  break;
                case "permissions":
                  setPermissionsSelected(channel.channelID);
                  break;
                case "realmCode":
                  setRealmCodeSelected(channel.channelID);
                  break;
                default:
                  break;
              }
            });
          } else {
            setError("[FAIRPLAY-INTERNAL] CLIENT SIDE ERROR: " + savedData.error);
          }
        } catch(e) {
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
      { type: "ban/unban", channelID: banUnbanSelected },
      { type: "close/open", channelID: closeOpenSelected },
      { type: "backup", channelID: backupSelected },
      { type: "permissions", channelID: permissionsSelected },
      { type: "realmCode", channelID: realmCodeSelected },
    ];

    const allChannels = channelMappings
      .filter((mapping) => mapping.channelID !== null)
      .map((mapping) => ({
        type: mapping.type,
        channelID: mapping.channelID,
      }));

    const payload = { allChannels };

    saveChannels(guildID, payload)
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
    setBanUnbanSelected(null);
    setCloseOpenSelected(null);
    setBackupSelected(null);
    setPermissionsSelected(null);
    setRealmCodeSelected(null);
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
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <LogDropdown
          title="Ban/Unban Logs"
          description="Triggers when a user is banned or unbanned from the server."
          channels={channels}
          selected={banUnbanSelected}
          setSelected={setBanUnbanSelected}
        />
        <LogDropdown
          title="Close/Open Logs"
          description="Triggers when a channel or thread is closed or reopened."
          channels={channels}
          selected={closeOpenSelected}
          setSelected={setCloseOpenSelected}
        />
        <LogDropdown
          title="Backup Logs"
          description="Triggers when a server backup is created, updated, or restored."
          channels={channels}
          selected={backupSelected}
          setSelected={setBackupSelected}
        />
        <LogDropdown
          title="Permissions Change Logs"
          description="Triggers when channel or role permissions are updated."
          channels={channels}
          selected={permissionsSelected}
          setSelected={setPermissionsSelected}
        />
        <LogDropdown
          title="Realm-Code Modification Logs"
          description="Triggers when the server's realm code or related setting is changed."
          channels={channels}
          selected={realmCodeSelected}
          setSelected={setRealmCodeSelected}
        />
      </div>
      <div className="flex flex-wrap justify-center space-x-4 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
