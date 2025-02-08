"use client";
import { FiAlertTriangle } from "react-icons/fi";
import { FaCog, FaPlug, FaPowerOff, FaHourglassHalf, FaCheck } from "react-icons/fa";
import renderColoredText from "../renderColoredText";

export default function RealmCard({ realm, onConnect, onDisconnect, onSettings }) {
  return (
    <div
      key={realm.id}
      className="bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-center p-4">
        <img
          src={realm.clubPicture}
          alt={realm.name}
          className="w-24 h-24 object-cover rounded"
        />
        <div className="ml-4 flex-1">
          <h2 className="text-lg font-semibold text-white">{renderColoredText(realm.name)}</h2>
          {realm.daysLeft < 0 && (
            <div className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded mt-2 max-w-xs">
              <FiAlertTriangle className="mr-2" />
              <span>Realm Expired</span>
            </div>
          )}
          {realm.daysLeft > 0 && realm.daysLeft < 7 && (
            <div className="flex items-center bg-orange-500 text-white px-3 py-1 rounded mt-2 max-w-xs">
              <FiAlertTriangle className="mr-2" />
              <span>{realm.daysLeft}d until expiry</span>
            </div>
          )}
          <div
            className={`flex items-center px-3 py-1 rounded mt-2 max-w-xs ${
              realm.daysLeft < 0
                ? "bg-red-500 text-white"
                : realm.online
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {realm.daysLeft < 0 ? (
              <FiAlertTriangle className="mr-2" />
            ) : realm.online ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaHourglassHalf className="mr-2" />
            )}
            <span>
              {realm.daysLeft < 0
                ? "Unable to connect"
                : realm.online
                ? "Inside the realm, monitoring"
                : "Able to connect"}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex justify-between text-gray-300">
          <span>Members: {realm.players.accepted}</span>
          <span>Online: {realm.players.onlinePlayers.length}</span>
          <span>Invited Members: {realm.players.pending}</span>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={
              realm.daysLeft < 0
                ? null
                : realm.online
                ? () => onDisconnect(realm.id)
                : () => onConnect(realm.id)
            }
            disabled={realm.daysLeft < 0 || realm.connecting}
            className={`flex-1 px-4 py-2 rounded flex items-center justify-center ${
              realm.daysLeft < 0 || realm.connecting
                ? "bg-gray-500 cursor-not-allowed text-gray-300"
                : realm.online
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {realm.online ? (
              <>
                <FaPowerOff className="mr-2" />
                Disconnect from realm
              </>
            ) : realm.connecting ? (
              <span>Connecting...</span>
            ) : (
              <>
                <FaPlug className="mr-2" />
                Connect to realm
              </>
            )}
          </button>
          <button
            onClick={() => onSettings(realm.id)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <FaCog />
          </button>
        </div>
      </div>
    </div>
  );
}
