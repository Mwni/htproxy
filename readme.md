# htproxy

A small script to spin up a basic auth protected HTTP proxy.

```
npm install -g htproxy
```

### Add user

```
htproxy adduser [username]
```

You will be prompted for as password.

### Delete user

```
htproxy deluser [username]
```

### Launch

```
htproxy --port 8080 --ssl-key ./key.pem --ssl-cert ./cert.pem
```