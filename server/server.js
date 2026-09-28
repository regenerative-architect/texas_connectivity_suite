import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer,WebSocket} from 'ws';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(__dirname,'..');
const DATA=path.resolve(__dirname,'data');
const PORT=Number(process.env.PORT||8787);
const HOST=process.env.HOST||'0.0.0.0';
const ROOM_SECRET=process.env.ROOM_SECRET||'';
const PERSIST=String(process.env.PERSIST_ROOMS||'true').toLowerCase()!=='false';
const MAX_EVENTS=1500;
const MAX_MESSAGE=256*1024;
fs.mkdirSync(DATA,{recursive:true});

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8'};
const cleanRoom=s=>String(s||'').replace(/[^a-zA-Z0-9_.-]/g,'').slice(0,80)||'texas-commons';
const safeMember=m=>({clientId:String(m?.clientId||'').slice(0,100),name:String(m?.name||'Member').slice(0,80),role:String(m?.role||'participant').slice(0,60),room:cleanRoom(m?.room),lastSeen:new Date().toISOString()});
const rooms=new Map();
function fileFor(room){return path.join(DATA,`${cleanRoom(room)}.jsonl`)}
function loadEvents(room){if(!PERSIST)return[];try{return fs.readFileSync(fileFor(room),'utf8').split('\n').filter(Boolean).map(line=>JSON.parse(line)).filter(x=>x?.type==='event').slice(-MAX_EVENTS)}catch{return[]}}
function persistEvent(room,event){if(!PERSIST)return;fs.appendFile(fileFor(room),JSON.stringify(event)+'\n',()=>{})}
function roomState(id){id=cleanRoom(id);if(!rooms.has(id))rooms.set(id,{id,clients:new Set(),events:loadEvents(id),seen:new Set()});const r=rooms.get(id);for(const e of r.events)if(e.eventId)r.seen.add(e.eventId);return r}
function members(r){return [...r.clients].filter(ws=>ws.readyState===WebSocket.OPEN&&ws.member).map(ws=>ws.member)}
function send(ws,obj){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj))}
function broadcast(r,obj,except=null){const data=JSON.stringify(obj);for(const c of r.clients)if(c!==except&&c.readyState===WebSocket.OPEN)c.send(data)}

const server=http.createServer((req,res)=>{
 const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
 if(url.pathname==='/healthz'){res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({ok:true,service:'tx-connectivity-room-server',version:'2.0.0',persistence:PERSIST}));return}
 let rel=decodeURIComponent(url.pathname);if(rel==='/'||rel==='')rel='/index.html';
 const requested=path.resolve(ROOT,'.'+rel);
 if(!requested.startsWith(ROOT+path.sep)){res.writeHead(403);res.end('Forbidden');return}
 fs.stat(requested,(err,st)=>{
  if(err||!st.isFile()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');return}
  const ext=path.extname(requested);const headers={'content-type':mime[ext]||'application/octet-stream','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'};
  if(ext==='.html')headers['content-security-policy']="default-src 'self'; script-src 'self' https://esm.run; style-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss: https://esm.run https://*.huggingface.co https://huggingface.co https://raw.githubusercontent.com https://github.com; worker-src 'self' blob: https://esm.run; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
  res.writeHead(200,headers);fs.createReadStream(requested).pipe(res);
 })
});

const wss=new WebSocketServer({noServer:true,maxPayload:MAX_MESSAGE});
server.on('upgrade',(req,socket,head)=>{
 const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
 if(url.pathname!=='/ws'){socket.destroy();return}
 if(ROOM_SECRET&&url.searchParams.get('key')!==ROOM_SECRET){socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');socket.destroy();return}
 wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
});

wss.on('connection',ws=>{
 ws.roomId=null;ws.member=null;ws.isAlive=true;
 ws.on('pong',()=>ws.isAlive=true);
 ws.on('message',raw=>{
  let msg;try{msg=JSON.parse(raw.toString())}catch{return}
  if(msg?.type==='join'){
   const room=cleanRoom(msg.room);ws.roomId=room;ws.member=safeMember({...msg.member,room});const r=roomState(room);r.clients.add(ws);
   send(ws,{type:'snapshot',room,events:r.events,members:members(r)});broadcast(r,{type:'presence',room,member:ws.member},ws);return;
  }
  if(!ws.roomId)return;const r=roomState(ws.roomId);
  if(msg?.type==='presence'){
   ws.member=safeMember({...msg.member,room:ws.roomId});broadcast(r,{type:'presence',room:ws.roomId,member:ws.member},ws);return;
  }
  if(msg?.type==='event'){
   const allowed=new Set(['task','decision','comment','project','evidence','activity']);if(!allowed.has(msg.entityType)||!msg.eventId||!msg.payload?.id)return;
   const event={type:'event',eventId:String(msg.eventId).slice(0,120),room:ws.roomId,entityType:msg.entityType,payload:msg.payload,actor:ws.member||safeMember(msg.actor),sentAt:new Date().toISOString()};
   if(r.seen.has(event.eventId))return;r.seen.add(event.eventId);r.events.push(event);if(r.events.length>MAX_EVENTS)r.events.splice(0,r.events.length-MAX_EVENTS);persistEvent(ws.roomId,event);broadcast(r,event,null);return;
  }
 });
 ws.on('close',()=>{if(!ws.roomId)return;const r=roomState(ws.roomId);r.clients.delete(ws);broadcast(r,{type:'presence-list',room:ws.roomId,members:members(r)},null);if(r.clients.size===0&&r.events.length===0)rooms.delete(ws.roomId)});
});
setInterval(()=>{for(const ws of wss.clients){if(ws.isAlive===false){ws.terminate();continue}ws.isAlive=false;ws.ping()}},30000).unref();
server.listen(PORT,HOST,()=>console.log(`Texas Connectivity OS server listening on http://${HOST}:${PORT} (WebSocket /ws)`));
