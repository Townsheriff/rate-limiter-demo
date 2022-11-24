# Starting Dev Env

1. Copy paste the env `cp backend/.env.example backend/.env`
2. Install deps `npm --prefix backend i`
3. Command: `docker-compose up -V --build`

## Test

Set in the env file to debug 3 requests per 5 seconds:

```
RATE_LIMITER_AUTH_MAX_REQ=3
RATE_LIMITER_AUTH_WINDOW_SIZE=5000
RATE_LIMITER_NOT_AUTH_MAX_REQ=3
RATE_LIMITER_NOT_AUTH_WINDOW_SIZE=5000
```

## Routes

- Public route: `http://localhost:3000/public/info`

- Private route: `http://localhost:3000/private/info?token=SecretToken`
