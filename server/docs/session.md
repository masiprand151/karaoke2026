# Session API

## Checkin

Endpoint POST /session/checkin

Body:

```JSON
{
  "roomId": 1,
  "pricingId": 1,
  "customerName": "test",
  "userId": 1,
  "durationMinutes": 60
}
```

## Free Minute

Endpoint POST /session/free-minute
Body:

```JSON
{
  "sessionId": 1,
  "addMinutes": 60
}
```

## Edit Duration

Endpoint PUT /session/duration

Body:

```JSON
{
  "sessionId": 1,
  "durationMinutes": 60
}
```

## Extend Duration

Endpoint POST /session/extend
Body:

```JSON
{
  "sessionId": 1,
  "extendMinutes": 60
}
```

## Preview

Endpoint GET /session/preview/:sessionId

## Checkout

Endpoint POST /session/preview/:sessionId

## Payment

Endpoint POST /session/payment/:transactionId

Body:

```JSON
{
  "amount": 10000,
  "method": "cash"
}
```

## Discount Room

Endpoint POST /session/discount
Body:

```JSON
{
  "transactionId": 1,
  "discount": 10
}
```
