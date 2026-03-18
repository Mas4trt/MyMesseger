package handler

import (
	"go-chat/room"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func WebSocketHandler(manager *room.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		nickname := r.URL.Query().Get("nickname")

		rm := manager.GetRoom(token)
		if rm == nil {
			http.Error(w, "Команата не найдена", http.StatusNotFound)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		client := &room.Client{
			Nickname: nickname,
			Conn:     conn,
		}

		rm.Clients[client] = true

		defer func() {
			delete(rm.Clients, client)
			conn.Close()
		}()

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}

			fullMessage := client.Nickname + ": " + string(msg)

			for c := range rm.Clients {
				c.Conn.WriteMessage(websocket.TextMessage, []byte(fullMessage))
			}
		}
	}
}
