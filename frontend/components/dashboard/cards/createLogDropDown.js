"use client";

import { useState } from "react";

export default function LogDropdown({
  title,
  description,
  channels,
  selected,
  setSelected,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredChannels, setFilteredChannels] = useState(channels || []);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredChannels(
      channels.filter((channel) =>
        channel.name.toLowerCase().includes(query)
      )
    );
  };

  const handleSelect = (channel) => {
    setSelected(channel.id);
    setIsOpen(false);
    setSearchQuery("");
    setFilteredChannels(channels);
  };

  const selectedChannel = channels.find(channel => channel.id === selected);

  return (
    <div className="flex flex-col bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-lg">
      <div className="flex flex-col justify-between h-full">
        <div>
          <h3 className="text-white font-semibold mb-2 text-center">{title}</h3>
          <p className="text-gray-300 text-sm text-center">{description}</p>
        </div>
        <div className="relative mt-4">
          <button
            className="bg-gray-700 text-white rounded border border-gray-600 p-2 w-full flex justify-between items-center"
            onClick={toggleDropdown}
          >
            <span>
              {selected ? (selectedChannel ? selectedChannel.name : "Select a channel") : "Select a channel"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
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
              isOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center p-2 bg-gray-700 rounded-t-md">
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-3 py-2 text-gray-200 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto dropdown-scrollable">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    className="w-full bg-gray-800 text-white p-2 hover:bg-gray-700 text-left"
                    onClick={() => handleSelect(channel)}
                  >
                    {channel.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-400 p-2 text-center">No channels found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
