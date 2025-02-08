// events/textEvent.go
package events

import (
	"encoding/json"

	"github.com/sandertv/gophertunnel/minecraft/protocol/packet"
)

type TextEvent struct {
	Type string        `json:"type"`
	Data TextEventData `json:"data"`
}

type TextEventData struct {
	TextType         int         `json:"TextType"`
	NeedsTranslation bool        `json:"NeedsTranslation"`
	SourceName       string      `json:"SourceName"`
	Message          string      `json:"Message"`
	Parameters       interface{} `json:"Parameters"`
	XUID             string      `json:"XUID"`
	PlatformChatID   string      `json:"PlatformChatID"`
	FilteredMessage  string      `json:"FilteredMessage"`
}

func BuildTextEventPayload(p *packet.Text) ([]byte, error) {
	event := TextEvent{
		Type: "text",
		Data: TextEventData{
			TextType:         int(p.TextType),
			NeedsTranslation: p.NeedsTranslation,
			SourceName:       p.SourceName,
			Message:          p.Message,
			Parameters:       p.Parameters,
			XUID:             p.XUID,
			PlatformChatID:   p.PlatformChatID,
			FilteredMessage:  p.FilteredMessage,
		},
	}
	return json.Marshal(event)
}
