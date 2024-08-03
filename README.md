# mock server

> A streamlined HTTP mock server

## Usages

1. Install

```typescript
pnpm add @gaonengwww/mock-server
```

2. Use `createMockServer` function
```js
// index.js

const {createMockServer} = require('@gaonengwww/mock-server');

createMockServer({
  mocks:[
    {
      url: '/api/test',
      response: ()=>{
        return {foo: 'bar'}
      }
    }
  ]
})
```

3. run index.js

```bash
node index.js
```

4. send request

```bash
curl -vv http://localhost:8848/api/test

# * Connected to localhost (127.0.0.1) port 8848 (#0)
# > GET /api/test HTTP/1.1
# > Host: localhost:8848
# > User-Agent: curl/7.88.1
# > Accept: */*
# > 
# < HTTP/1.1 200 OK
# < Content-Type: application/json
# < Date: Mon, 29 Jul 2024 05:47:29 GMT
# < Connection: keep-alive
# < Keep-Alive: timeout=5
# < Transfer-Encoding: chunked
# <
# {"foo":"bar"}* Connection #0 to host localhost left intact
```

### Parse Body

You can use `body` get post body

```js
const {createMockServer} = require('@gaonengwww/mock-server');

createMockServer({
  mocks:[
    {
      method: 'post',
      url: '/api/test',
      response: ({body})=>{
        console.log(`Hello ${body.name}!`);
        return {};
      }
    }
  ]
})
```

```bash
curl http://localhost:8848/api/test -X POST --data '{"name":"Joe"}' --header "Content-Type: application/json"
# server side should output "hello Joe!"
```

### Different method

```js
const {createMockServer} = require('@gaonengwww/mock-server');

createMockServer({
  mocks:[
    {
      method: 'post',
      url: '/api/test',
      response: ({body})=>{
        console.log(`Hello ${body.name}!`);
        return {};
      }
    },
    {
      url: '/api/test',
      response: ()=>{
        return {foo: 'bar'}
      }
    }
  ]
})
```

```bash
curl http://localhost:8848/api/test -X POST --data '{"name":"Joe"}' --header "Content-Type: application/json"
# server side should output "hello Joe!"
curl http://localhost:8848/api/test
# {"foo":"bar"}
```

### Custom status code

```js
// index.js

const {createMockServer} = require('@gaonengwww/mock-server');

createMockServer({
  mocks:[
    {
      url: '/api/test',
      response: ()=>{
        return {foo: 'bar'}
      },
      statusCode: 404
    }
  ]
})
```

```bash
curl http://localhost:8848/api/test -vv

# > GET /api/test HTTP/1.1
# > Host: localhost:8848
# > User-Agent: curl/7.55.1
# > Accept: */*
# >
# < HTTP/1.1 404 Not Found
# < Content-Type: application/json
# < Date: Mon, 29 Jul 2024 06:00:37 GMT
# < Connection: keep-alive
# < Keep-Alive: timeout=5
# < Transfer-Encoding: chunked
# <
# {"foo":"bar"}* Connection #0 to host localhost left intact
```

### Timeout

```js
const {createMockServer} = require('@gaonengwww/mock-server');

createMockServer({
  mocks:[
    {
      method:'get',
      timeout: 1500,
      url: '/api/test',
      response: ()=>{
        return {foo:'bar'};
      }
    }
  ]
})
```

```bash
curl -o /dev/null -s -w "%{time_starttransfer} - %{time_total}" http://localhost:8848/api/test
1.511512 - 1.51158
```

### Cli

```
mock-server -h
```

## license

MIT