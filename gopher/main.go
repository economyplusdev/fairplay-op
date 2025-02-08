package main

import (
	"encoding/json"
	"log"
	"os"
	"strings"
	"time"

	"gophertunnel/events"
	"gophertunnel/modules"
	"gophertunnel/modules/fetch"
	"gophertunnel/modules/wsclient"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/sandertv/gophertunnel/minecraft"
	"github.com/sandertv/gophertunnel/minecraft/protocol"
	"github.com/sandertv/gophertunnel/minecraft/protocol/packet"
)

// startWebSocketWriter establishes a connection and continuously writes messages
// (e.g. Minecraft events) to the WebSocket.
func startWebSocketWriter(realmID, discordID string) chan []byte {
	wsMsgChan := make(chan []byte, 100)
	go func() {
		var wsConn *websocket.Conn
		var err error
		for {
			// (Re)connect if necessary.
			if wsConn == nil {
				wsConn, err = wsclient.ConnectAndAuthenticate(realmID, discordID)
				if err != nil {
					time.Sleep(5 * time.Second)
					continue
				}
			}
			// Wait for a message to write.
			msg := <-wsMsgChan
			err = wsConn.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				wsConn.Close()
				wsConn = nil
				// Put the message back on the channel to be sent once reconnected.
				go func(m []byte) {
					wsMsgChan <- m
				}(msg)
				time.Sleep(1 * time.Second)
			}
		}
	}()
	return wsMsgChan
}

// startWebSocketReader connects to the WebSocket server and listens for incoming
// messages. When it receives a JSON message with command "Fairplay.NewEvent.DiscordMessage",
// it builds a tellraw command (using proper JSON escaping) and sends it on the
// provided mcCmdChan so that the Minecraft connection may send it.
func startWebSocketReader(realmID, discordID string, mcCmdChan chan<- string) {
	for {
		wsConn, err := wsclient.ConnectAndAuthenticate(realmID, discordID)
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}
		for {
			_, msg, err := wsConn.ReadMessage()
			if err != nil {
				wsConn.Close()
				break // reconnect
			}
			// Unmarshal the message into a generic map.
			var data map[string]interface{}
			if err := json.Unmarshal(msg, &data); err != nil {
				log.Println("fairplay.newEvent.WebSocketMessageUnmarshalError:", err)
				continue
			}
			// Look for a Discord message.
			if command, ok := data["command"].(string); ok && command == "Fairplay.NewEvent.DiscordMessage" {
				if d, ok := data["data"].(map[string]interface{}); ok {
					if message, ok := d["message"].(string); ok {
						mcCmdChan <- message
					}
				}
			}

		}
		time.Sleep(1 * time.Second)
	}
}

// runEvent connects to the Minecraft server and processes incoming packets.
// It also spawns a goroutine that listens for commands (such as tellraw commands)
// from Discord (forwarded on mcCmdChan) and sends them to the server.
func runEvent(realmID, discordID string, wsMsgChan chan []byte, mcCmdChan <-chan string) error {
	log.Println("fairplay.newEvent.findingServer")
	serverAddress, err := fetch.GetServerAddress(realmID, discordID)
	if err != nil {
		log.Println("fairplay.newEvent.ConnectionFailed:", err)
		return err
	}
	log.Println("fairplay.newEvent.foundServer")
	tokenSource := modules.TokenSource()
	log.Println("fairplay.newEvent.connecting")
	dialer := minecraft.Dialer{
		TokenSource: tokenSource,
	}
	conn, err := dialer.Dial("raknet", serverAddress)
	if err != nil {
		log.Println("fairplay.newEvent.ConnectionFailed:", err)
		return err
	}
	defer conn.Close()
	log.Println("fairplay.newEvent.connected")
	if err := conn.DoSpawn(); err != nil {
		log.Println("fairplay.newEvent.SpawnFailed:", err)
		return err
	}

	go func() {
		for {
			cmd, ok := <-mcCmdChan
			if !ok {
				return
			}

			origin := protocol.CommandOrigin{
				Origin:         0,
				UUID:           uuid.New(),
				RequestID:      "",
				PlayerUniqueID: 0,
			}

			err := conn.WritePacket(&packet.CommandRequest{
				CommandLine:   "/give @a dirt 64",
				CommandOrigin: origin,
				Internal:      false,
				Version:       38,
			})

			if err != nil {
				log.Println("fairplay.newEvent.CommandSendError:", err)
			} else {
				log.Println("fairplay.newEvent.CommandSent:", cmd)
			}

		}
	}()

	listedPlayers := make(map[string]struct{})
	for {
		pk, err := conn.ReadPacket()
		if err != nil {
			log.Println("fairplay.newEvent.PacketReadError:", err)
			return err
		}
		switch p := pk.(type) {
		case *packet.SetLocalPlayerAsInitialised:
			log.Println("fairplay.newEvent.SpawnSuccess")
		case *packet.Text:
			data, err := events.BuildTextEventPayload(p)
			if err != nil {
				log.Println("fairplay.newEvent.TextEventBuildError:", err)
			} else {
				wsMsgChan <- data
			}
		case *packet.PlayerList:
			if p.ActionType == packet.PlayerListActionAdd {
				changed := false
				for _, entry := range p.Entries {
					if _, exists := listedPlayers[entry.Username]; !exists {
						listedPlayers[entry.Username] = struct{}{}
						changed = true
					}
				}
				if changed {
					members := make([]string, 0, len(listedPlayers))
					for username := range listedPlayers {
						members = append(members, username)
					}
					err := fetch.UpdateMemberList(realmID, members)
					if err != nil {
						log.Println("fairplay.newEvent.UpdateMemberListError:", err)
					}
				}
			}
		default:
		}
	}
}

func main() {
	log.SetFlags(0)
	if len(os.Args) < 3 {
		log.Fatalf("fairplay.newEvent.InvalidUsage")
	}
	realmID := os.Args[1]
	discordID := os.Args[2]
	wsMsgChan := startWebSocketWriter(realmID, discordID)
	// Create a channel for Minecraft commands that will be triggered by Discord messages.
	mcCmdChan := make(chan string, 100)
	// Start a goroutine that listens for WebSocket messages from Discord.
	go startWebSocketReader(realmID, discordID, mcCmdChan)

	// Main loop: (re)connect to the Minecraft server and run the event loop.
	for {
		if err := runEvent(realmID, discordID, wsMsgChan, mcCmdChan); err != nil {
			// If the error message contains a kick, exit immediately.
			if strings.Contains(err.Error(), "%disconnect.kicked") {
				os.Exit(1)
			}
			os.Exit(1)
			time.Sleep(5 * time.Second)
		}
	}
}
