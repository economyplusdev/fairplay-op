// sPermissions.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GridLoader, ClipLoader } from "react-spinners";
import { getRoles } from "@/components/fetch/getRoles";
import { getSavedRoles } from "@/components/fetch/dashboard/getSavedRoles";
import { saveRoles } from "@/components/fetch/dashboard/saveRoles";
import Notification from "@/components/dashboard/cards/createNotification";

export default function RolesPermissions() {
  const { id: guildID } = useParams();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [dropdowns, setDropdowns] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const commands = [
    { key: "ban/unban", title: "Ban/Unban Permissions", description: "Manage bans and unbans." },
    { key: "close/open", title: "Close/Open Permissions", description: "Manage channel closures and openings." },
    { key: "backup", title: "Backup Permissions", description: "Manage server backups." },
    { key: "permissions", title: "Permissions Change", description: "Manage role and channel permissions." },
    { key: "realmCode", title: "Realm Code Modification", description: "Manage realm code changes." },
    { key: "players", title: "Online players", description: "View online players for a realm" },

  ];

  useEffect(() => {
    if (guildID) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const rolesData = await getRoles(guildID);
          if (rolesData.success) {
            const filteredRoles = rolesData.roles.filter(
              (role) => role.name !== "－－－－－－－－" && role.name !== "@everyone"
            );
            setRoles(filteredRoles);
            const validRoleIds = new Set(filteredRoles.map((role) => role.id));

            const savedData = await getSavedRoles(guildID);
            if (savedData.success) {
              const savedPermissionsArray = savedData.roles.rolesPermissions || [];
              const initializedPermissions = {};

              commands.forEach((command) => {
                initializedPermissions[command.key] = [];
              });

              savedPermissionsArray.forEach((perm) => {
                const { role, roles: roleIds } = perm;
                if (commands.some((cmd) => cmd.key === role)) {
                  initializedPermissions[role] = roleIds.filter((id) => validRoleIds.has(id));
                }
              });

              setPermissions(initializedPermissions);
            } else {
              setError("[CLIENT ERROR] " + savedData.error);
            }
          } else {
            setError("[CLIENT ERROR] " + rolesData.error);
          }
        } catch (err) {
          console.error(err);
          setError("An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [guildID]);

  const handlePermissionChange = (commandKey, roleId) => {
    setPermissions((prevPermissions) => {
      const currentRoles = prevPermissions[commandKey] || [];
      if (currentRoles.includes(roleId)) {
        return {
          ...prevPermissions,
          [commandKey]: currentRoles.filter((id) => id !== roleId),
        };
      } else {
        return {
          ...prevPermissions,
          [commandKey]: [...currentRoles, roleId],
        };
      }
    });
  };

  const toggleDropdown = (commandKey) => {
    setDropdowns((prev) => ({
      ...prev,
      [commandKey]: !prev[commandKey],
    }));
  };

  const handleSearch = (commandKey, query) => {
    setSearchQueries((prev) => ({
      ...prev,
      [commandKey]: query.toLowerCase(),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const payload = {
      rolesPermissions: commands.map((command) => ({
        role: command.key,
        roles: permissions[command.key] || [],
      })),
    };

    saveRoles(guildID, payload)
      .then((data) => {
        if (data.success) {
          setNotification({ message: "Permissions saved successfully!", type: "success" });
        } else {
          setNotification({ message: "Failed to save permissions.", type: "error" });
        }
      })
      .catch(() => {
        setNotification({ message: "An error occurred while saving permissions.", type: "error" });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleReset = () => {
    const resetPermissions = {};
    commands.forEach((command) => {
      resetPermissions[command.key] = [];
    });
    setPermissions(resetPermissions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GridLoader color="#ffffff" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-red-500 text-lg">{error}</p>
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
        {commands.map((command) => {
          const selectedRoles = roles.filter((role) => permissions[command.key]?.includes(role.id));
          let buttonLabel = "Select Roles";
          if (selectedRoles.length > 0) {
            if (selectedRoles.length <= 2) {
              buttonLabel = selectedRoles.map((r) => r.name).join(", ");
            } else {
              buttonLabel = `${selectedRoles.slice(0, 2).map((r) => r.name).join(", ")} and ${
                selectedRoles.length - 2
              } more`;
            }
          }

          return (
            <div key={command.key} className="flex flex-col bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-white font-semibold mb-2 text-center">{command.title}</h3>
                  <p className="text-gray-300 text-sm text-center">{command.description}</p>
                </div>
                <div className="relative mt-4">
                  <button
                    className="bg-gray-700 text-white rounded border border-gray-600 p-2 w-full flex justify-between items-center transition-transform duration-200"
                    onClick={() => toggleDropdown(command.key)}
                  >
                    <span>{buttonLabel}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdowns[command.key] ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`absolute z-10 w-full bg-gray-900 rounded-md mt-2 shadow-lg transform-gpu transition-all duration-300 ease-out origin-top ${
                      dropdowns[command.key]
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center p-2 bg-gray-700 rounded-t-md">
                      <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchQueries[command.key] || ""}
                        onChange={(e) => handleSearch(command.key, e.target.value)}
                        className="w-full px-3 py-2 text-gray-200 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-gray-500 outline-none"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {roles
                        .filter((role) =>
                          role.name.toLowerCase().includes(searchQueries[command.key] || "")
                        )
                        .map((role) => (
                          <label key={role.id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                            <input
                              type="checkbox"
                              checked={permissions[command.key]?.includes(role.id) || false}
                              onChange={() => handlePermissionChange(command.key, role.id)}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span className="text-gray-200">{role.name}</span>
                          </label>
                        ))}
                      {roles.filter((role) =>
                        role.name.toLowerCase().includes(searchQueries[command.key] || "")
                      ).length === 0 && (
                        <p className="text-gray-400 text-center p-2">No roles found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202c;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 4px;
          border: 2px solid #1a202c;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #2d3748;
        }
      `}</style>
    </div>
  );
}
