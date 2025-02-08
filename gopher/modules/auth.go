package modules

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/sandertv/gophertunnel/minecraft/auth"
	"golang.org/x/oauth2"
)

func TokenSource() oauth2.TokenSource {
	check := func(err error) {
		if err != nil {
			log.Fatalf("Error: %v", err)
		}
	}

	token := new(oauth2.Token)
	tokenData, err := os.ReadFile("token.tok")
	if err == nil {
		err = json.Unmarshal(tokenData, token)
		check(err)
	} else {
		log.Println("No cached token found. Logging in...")
		token, err = auth.RequestLiveToken()
		check(err)
	}

	src := auth.RefreshTokenSource(token)

	_, err = src.Token()
	if err != nil {
		log.Println("Cached token expired. Logging in again...")
		token, err = auth.RequestLiveToken()
		check(err)
		src = auth.RefreshTokenSource(token)
	}

	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
		<-c

		tok, _ := src.Token()
		tokenData, _ := json.Marshal(tok)
		_ = os.WriteFile("token.tok", tokenData, 0644)
		os.Exit(0)
	}()

	return src
}
