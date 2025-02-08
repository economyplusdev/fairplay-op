// fetch/updateMemberList.go
package fetch

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func UpdateMemberList(realmID string, members []string) error {
	data, err := json.Marshal(members)
	if err != nil {
		return err
	}
	url := "http://localhost:1112/api/fairplay/setMemberlist/" + realmID
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}
