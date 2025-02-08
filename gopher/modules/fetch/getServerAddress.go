package fetch

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type APIResponse struct {
	Success bool   `json:"success"`
	Address string `json:"address"`
}

func GetServerAddress(realmID string, discordID string) (string, error) {
	apiURL := fmt.Sprintf("http://localhost:1112/api/realms/getRealmIP/%s?realmID=%s", discordID, realmID)
	client := http.Client{
		Timeout: 60 * time.Second,
	}
	resp, err := client.Get(apiURL)
	if err != nil {
		return "", fmt.Errorf("failed to get server address: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned non-OK status: %s", resp.Status)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("reading response body failed: %w", err)
	}
	var apiResp APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return "", fmt.Errorf("JSON unmarshalling failed: %w", err)
	}
	if !apiResp.Success {
		return "", fmt.Errorf("API indicated failure")
	}
	return apiResp.Address, nil
}
