"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaPlug, FaPowerOff } from "react-icons/fa";
import { getSessionToken } from "../fetch/getSessionToken";

export default function Terminal() {
  const { id: guildID, realmID } = useParams();
  const [sessionToken, setSessionToken] = useState("");
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const commandsList = ["help", "close", "list", "clear"];
  
  useEffect(() => {
    if (connected) {
      setOutput((prev) => [...prev, "Connecting to terminal..."]);
      const socket = new WebSocket("ws://localhost:6969/terminal");
      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.command === "Fairplay.NewEvent.AwaitingAuthentication") {
            const authPayload = {
              authenticate: true,
              type: "guest",
              realmID: realmID,
              guildID: guildID,
              authentication: await getSessionToken(guildID),
            };
            socket.send(JSON.stringify(authPayload));
            return;
          }
          if (message.command === "Fairplay.NewEvent.AuthenticationSuccess") {
            setOutput((prev) => [...prev, "Connected to terminal"]);
            return;
          }
        } catch (error) {}
        setOutput((prev) => [...prev, event.data]);
      };
      socket.onclose = () => {
        setOutput((prev) => [...prev, "Disconnected"]);
        setConnected(false);
      };
      setWs(socket);
    } else {
      ws?.close();
    }
    return () => ws?.close();
  }, [connected, guildID, realmID, sessionToken]);

  const handleSend = () => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;
    if (trimmedCommand.toLowerCase() === "clear") {
      setOutput([]);
      setCommand("");
      return;
    }
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(trimmedCommand);
      setOutput((prev) => [...prev, `> ${trimmedCommand}`]);
      setCommand("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
      e.preventDefault();
    }
  };

  const matchingCommands = command
    ? commandsList.filter(
        (cmd) =>
          cmd.startsWith(command.toLowerCase()) && command.toLowerCase() !== cmd
      )
    : [];
  const suggestion = matchingCommands.length > 0 ? matchingCommands[0] : null;

  const handleSuggestionClick = () => {
    if (suggestion) {
      setCommand(suggestion);
    }
  };

  return (
    <div className="bg-gray-800 text-white font-mono p-4 flex flex-col h-80 rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold">Fairplay Interactive Terminal</div>
        <button
          onClick={() => setConnected(!connected)}
          className={`flex items-center px-3 py-1 rounded ${
            connected ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {connected ? <FaPowerOff className="mr-2" /> : <FaPlug className="mr-2" />}
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-2 bg-gray-900 bg-opacity-60 backdrop-blur-sm rounded p-2">
        {output.map((line, index) => {
          let lineStyle = "";
          if (line === "Connected to terminal") {
            lineStyle = "text-green-500";
          } else if (line === "Disconnected") {
            lineStyle = "text-red-500";
          } else if (index === 0) {
            lineStyle = "text-blue-500";
          }
          return (
            <div key={index} className={lineStyle}>
              {line}
            </div>
          );
        })}
      </div>
      {suggestion && (
        <div
          className="mb-2 bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600"
          onClick={handleSuggestionClick}
        >
          {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
        </div>
      )}
      <div className="border-t border-gray-600 pt-2 flex">
        <input
          type="text"
          className="bg-gray-800 text-white w-full outline-none"
          placeholder="Type a command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
