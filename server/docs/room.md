# Auth API

## Get all rooms

Endpoint: GET /room

- Rensponse :

```JSON
{
  "id": 1,
  "name": "R01",
  "capacity": 4,
  "status": "used",
  "sessions": []

}
```

## Get current room

Endpoint: GET /room/:id

- Response :

```JSON
{
  "id": 1,
  "name": "R01",
  "capacity": 4,
  "status": "used",
  "sessions": [],
  "pricings": []

}
```

## Move room

Endpoint: GET /room/move

- Request body:

```JSON
{ "sessionId": 1, "newRoomId": 2 }
```

- Response:

```JSON
{
  "session": {

  },
  "newRoom": {

  }
}
```
