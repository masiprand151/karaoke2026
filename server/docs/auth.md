# Auth API

## Login

Endpoint : POST /auth/login

- request body :

```JSON
{ username: "test", password: "test" }
```

- response

```JSON
{
  success: true,
  user: {
    id: 1,
    username: "test",
    role: "admin|staff",
  },
  token: "jklfjglkjfdlkgjfdlgk"
}
```
