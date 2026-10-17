import {timingSafeEqual} from 'node:crypto';
export const now = () => Math.floor(Date.now() / 1000);
export const randomToken = () => base64url(crypto.getRandomValues(new Uint8Array(32)));
export function base64url(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
export async function hash(text: string): Promise<string> { return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))); }
export async function passwordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  // Workers Web Crypto supports a maximum of 100,000 PBKDF2 iterations.
  return base64url(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256)));
}
export function equal(a: string, b: string): boolean { const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b); return x.length === y.length && timingSafeEqual(x,y); }
export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response { return Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}}); }
export function fail(message: string, status = 400): never { throw new Response(JSON.stringify({error:message}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}); }
export function sameOrigin(request: Request): void { if (request.headers.get('Origin') !== new URL(request.url).origin) fail('A same-origin request is required.',403); }
export async function bodyText(request: Request, max = 16384): Promise<string> {
  if (Number(request.headers.get('Content-Length') || 0) > max) fail('Request is too large.',413);
  const reader = request.body?.getReader(); if (!reader) return '';
  let length=0; const chunks: Uint8Array[]=[];
  for (;;) { const {done,value}=await reader.read(); if(done) break; length+=value.byteLength; if(length>max){await reader.cancel();fail('Request is too large.',413);} chunks.push(value); }
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return new TextDecoder().decode(bytes);
}
export async function jsonBody(request: Request): Promise<Record<string,unknown>> { try { const value: unknown=JSON.parse(await bodyText(request)); if(!value||typeof value!=='object'||Array.isArray(value)) fail('Expected a JSON object.');return value as Record<string,unknown>; } catch(e) {if(e instanceof Response)throw e;fail('Invalid JSON.');} }
export function escapeHtml(text: string): string { return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
export async function rateLimit(db: D1Database, request: Request, category: string, limit: number, seconds = 900): Promise<void> {
  const bucket=Math.floor(now()/seconds);const key=await hash(`${category}:${request.headers.get('CF-Connecting-IP')||'local'}:${bucket}`);
  const row=await db.prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(bucket+1)*seconds).first<{count:number}>();
  if(row && row.count>limit) fail('Too many requests. Please try again later.',429);
}
export type User = {id:string;username:string;password_hash:string;salt:string};
export async function sessionUser(request: Request, db: D1Database): Promise<User|null> { const cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)nz_session=([^;]+)/)?.[1];if(!cookie)return null;return db.prepare('SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.hash=? AND sessions.expires_at>?').bind(await hash(cookie),now()).first<User>(); }
export async function requireUser(request:Request,db:D1Database):Promise<User>{const user=await sessionUser(request,db);if(!user)fail('Sign in first.',401);return user;}
export function cookie(request:Request,value:string,age=604800):string { return `nz_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`; }
