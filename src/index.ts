import * as fg from 'fast-glob';
import {IncomingMessage,ServerResponse,createServer} from 'node:http';
import { isAbsolute } from 'node:path';
import { URL } from 'node:url';
interface MockMethod {
  url: string;
  method?: MethodType;
  timeout?: number;
  statusCode?: number;
  response?: ((this: RespThisType, opt: {
    url: Recordable;
    body: Recordable;
    query: Recordable;
    headers: Recordable;
  }) => any) | any;
  rawResponse?: (this: RespThisType, req: IncomingMessage, res: ServerResponse) => void;
}
type MethodType = 'get' | 'post' | 'put' | 'delete' | 'patch';
type Recordable<T = any> = Record<string, T>;
interface RespThisType {
  req: IncomingMessage;
  res: ServerResponse;
  parseJson: () => any;
}

export interface BootstarpOption {
  mocks: MockMethod[];
  port: number;
  hostname: string;
  pattern: string;
  patternOption: fg.Options
}
export interface Router {
  [url:string]: {
    [method: string]: {
      response: ((this: RespThisType, opt: {
        url: Recordable;
        body: Recordable;
        query: Recordable;
        headers: Recordable;
      }) => any);
      statusCode?: number;
      timeout?:number
    }
  }
}

const useLog = (prefix:string ='MOCK-SERVER')=> (...msg: any[]) => {
  console.log(`${prefix}: ${msg.join(' ')}`)
}

function parseJson(req: IncomingMessage): Promise<Recordable> {
  return new Promise((resolve) => {
    let jsonStr: Recordable = {}
    let str = ''
    req.on('data', function (chunk) {
      str += chunk
    })
    req.on('end', () => {
      try {
        jsonStr = JSON.parse(str)
      } catch (e) {
        const params = new URLSearchParams(str)
        const body: Recordable = {}
        params.forEach((value, key) => {
          body[key] = value
        })
        jsonStr = body
      }
      resolve(jsonStr)
      return
    })
  })
}
const sleep = (time: number) => {
  return new Promise((resolve)=>{
    setTimeout(() => {
      resolve(null);
    }, time);
  })
}

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

const isFunction = (val:unknown): val is Function => {
  return is(val, 'Function') || is(val, 'AsyncFunction')
}
export async function createMockServer(opt: Partial<BootstarpOption>){
  const {
    mocks=[],
    port=8848,
    hostname='0.0.0.0',
    pattern = '',
    patternOption = {}
  } = opt;
  const log = useLog('[App]');
  const routerLog = useLog('[App][Router]')
  if (pattern) {
    const paths = fg.sync(pattern, {
      ...patternOption
    })
    paths.forEach((value: string)=>{
      log(`Discover ${value}!`);
    })
    const importTasks:Promise<any>[] = [];
    for (const path of paths)  {
      const importTask = import(
        isAbsolute(path) ? `file://${path}` : path
      );
      importTasks.push(importTask);
    }
    const methods = Promise.all(importTasks)
    .then((modules)=>{
      return modules.map((m)=>{
        return m.default ?? m
      })
    })
    .catch((reason) => {
      console.error(reason);
      process.exit(-1);
    })
    mocks.push(...(await methods) ?? []);
  }
  const server = createServer();
  const router:Router = {};
  mocks
  .forEach((mock)=>{
    const url = mock.url;
    const method = mock.method?.toLowerCase() ?? 'get';
    const response = mock.response ?? (()=>{});
    const timeout = mock.timeout ?? 0;
    const statusCode = mock.statusCode ?? 200;
    if (!Object.keys(router[url] ?? {}).length){
      router[url] = {};
    }
    if (!router[url][method?.toLowerCase() ?? 'get']) {
      router[url][method?.toLowerCase() ?? 'get'] = {
        response,
        statusCode:statusCode ?? 200,
        timeout: timeout ?? 0
      }
    }
  })
  server.on('request', async (req,res) => {
    const url = new URL(`http://${hostname ?? '0.0.0.0'}${req.url}`);
    const {pathname} = url;
    if (!router[pathname]){
      res.end('');
      return;
    }
    const methods = req.method?.toLowerCase() ?? 'get';
    const route = router[pathname][methods];
    if (!router){
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(''); 
    }
    if (!route.response){
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end('');
      return;
    }
    const resp = route.response.bind({
      req,
      res,
      parseJson: parseJson.bind(null,req)
    })
    if (route.timeout){
      await sleep(route.timeout);
    }
    const body = await parseJson(req);
    const ret = resp({
      url,
      body,
      headers: req.headers,
      query: url.searchParams
    })
    if (!res.writableFinished){
      res.writeHead(route.statusCode ?? 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ret));
    }
    console.log(`Invoke ${methods}-${url}`)
  })
  server.on('error', (e) => {
    console.log(e);
  })
  server.listen(port, hostname, ()=>{
    // console.clear();
    if (!Object.entries(router).length){
      routerLog('No route found!');
    }
    for (const [path, route] of Object.entries(router)){
      for (const method of Object.keys(route)){
        routerLog(`[${method.toUpperCase()}]`, path)
      }
    }
    log(`Start at http://${hostname}:${port}/`)
  });
}