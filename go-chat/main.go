package main

import (
	"go-chat/handler"
	"go-chat/room"
	"net/http"
)

func main() {
	manager := room.NewManager()

	http.HandleFunc("/create", handler.CreateRoomHandler(manager))
	http.HandleFunc("/ws", handler.WebSocketHandler(manager))
	http.Handle("/", http.FileServer(http.Dir("./static")))

	http.ListenAndServe(":8080", nil)
}
