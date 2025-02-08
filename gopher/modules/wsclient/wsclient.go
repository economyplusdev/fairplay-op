// wsclient/wsclient.go
package wsclient

import (
	"encoding/json"
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

func ConnectAndAuthenticate(realmID, discordID string) (*websocket.Conn, error) {
	wsURL := url.URL{Scheme: "ws", Host: "localhost:6969", Path: "/fairplay"}
	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL.String(), nil)
	if err != nil {
		log.Printf("fairplay.newEvent.WebSocketConnectionFailed: %v", err)
		return nil, err
	}

	_, msg, err := wsConn.ReadMessage()
	if err != nil {
		log.Printf("fairplay.newEvent.WebSocketReadError: %v", err)
		wsConn.Close()
		return nil, err
	}
	var handshake map[string]interface{}
	if err := json.Unmarshal(msg, &handshake); err != nil {
		log.Printf("fairplay.newEvent.HandshakeUnmarshalError: %v", err)
		wsConn.Close()
		return nil, err
	}
	if handshake["command"] == "Fairplay.NewEvent.AwaitingAuthentication" {
		authMsg := map[string]interface{}{
			"authenticate": true,
			"realmID":      realmID,
			"discordID":    discordID,
		}
		authData, err := json.Marshal(authMsg)
		if err != nil {
			log.Printf("fairplay.newEvent.AuthMarshalError: %v", err)
			wsConn.Close()
			return nil, err
		}
		if err := wsConn.WriteMessage(websocket.TextMessage, authData); err != nil {
			log.Printf("fairplay.newEvent.WebSocketWriteError: %v", err)
			wsConn.Close()
			return nil, err
		}
		_, msg, err = wsConn.ReadMessage()
		if err != nil {
			log.Printf("fairplay.newEvent.WebSocketReadError: %v", err)
			wsConn.Close()
			return nil, err
		}
		var authResponse map[string]interface{}
		if err := json.Unmarshal(msg, &authResponse); err != nil {
			log.Printf("fairplay.newEvent.AuthResponseUnmarshalError: %v", err)
			wsConn.Close()
			return nil, err
		}
		if authResponse["command"] == "Fairplay.NewEvent.AuthenticationSuccess" {
			newEventMsg := map[string]interface{}{
				"command":   "Fairplay.NewEvent",
				"realmID":   realmID,
				"discordID": discordID,
			}
			newEventData, err := json.Marshal(newEventMsg)
			if err != nil {
				log.Printf("fairplay.newEvent.NewEventMarshalError: %v", err)
				wsConn.Close()
				return nil, err
			}
			if err := wsConn.WriteMessage(websocket.TextMessage, newEventData); err != nil {
				log.Printf("fairplay.newEvent.WebSocketWriteError: %v", err)
				wsConn.Close()
				return nil, err
			}
		}
	}
	return wsConn, nil
}
