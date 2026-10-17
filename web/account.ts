const $ = (s:string)=>document.querySelector<HTMLElement>(s)!;
let mode:'register'|'login'='register';
let currentUser:{id:string;username:string}|null=null;
export async function api<T=Record<string,unknown>>(path:string,method='GET',body?:unknown){
 const response=await fetch(path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 const result=await response.json() as Record<string,unknown>;if(!response.ok)throw new Error(typeof result.error==='string'?result.error:'Please try again.');return result as T;
}
function message(text:string){$('#account-message').textContent=text;}
export async function refreshAccount(){
 try{const value=await api<{user:{id:string;username:string}|null;token:{expires_at:number}|null}>('/api/auth/me');currentUser=value.user;
 $('#auth-form').hidden=!!currentUser;$('#account-controls').hidden=!currentUser;
 $('#account-name').textContent=currentUser?.username||'';
 $('#token-status').textContent=value.token?`Your personal connection key expires ${new Date(value.token.expires_at*1000).toLocaleDateString('en-NZ')}.`:'No personal connection key yet. Browser-based AI tools can connect using sign-in.';
 }catch{message('Account service unavailable. You can still explore the learning map.');}
}
export function setupAccount(){
 for(const button of document.querySelectorAll<HTMLButtonElement>('[data-auth-mode]'))button.onclick=()=>{
  mode=button.dataset.authMode as typeof mode;
  document.querySelectorAll('[data-auth-mode]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));
  $('#auth-submit').textContent=mode==='register'?'Create free parent account':'Sign in';
  $('#password')?.setAttribute('autocomplete',mode==='register'?'new-password':'current-password');
  message('');
 };
 $('#auth-form').onsubmit=async e=>{e.preventDefault();const button=$('#auth-submit') as HTMLButtonElement;button.disabled=true;
  try{const f=new FormData(e.target as HTMLFormElement);await api(`/api/auth/${mode}`,'POST',{username:f.get('username'),password:f.get('password')});
   (e.target as HTMLFormElement).reset();await refreshAccount();message(mode==='register'?'Your account is ready. Choose your AI tool below.':'You are signed in.');
   const back=new URLSearchParams(location.search).get('returnTo');if(back?.startsWith('/oauth/authorize?'))location.assign(back);
  }catch(err){message((err as Error).message);}finally{button.disabled=false;}
 };
 $('#logout').onclick=async()=>{try{await api('/api/auth/logout','POST');clearToken();await refreshAccount();message('Signed out.');}catch(e){message((e as Error).message);}};
 $('#create-token').onclick=async()=>{try{const value=await api<{token:string}>('/api/token','POST');($('#personal-token') as HTMLInputElement).value=value.token;$('#token-reveal').hidden=false;await refreshAccount();message('Save this key now. It is shown once. Creating another key replaces it.');}catch(e){message((e as Error).message);}};
 $('#revoke-token').onclick=async()=>{try{await api('/api/token','DELETE');clearToken();await refreshAccount();message('All AI connections revoked. Reconnect each tool to use it again.');}catch(e){message((e as Error).message);}};
 $('#copy-token').onclick=()=>copy(($('#personal-token') as HTMLInputElement).value,$('#copy-token'));
 $('#delete-account').onclick=()=>{($('#delete-dialog') as HTMLDialogElement).showModal();};
 $('#cancel-delete').onclick=()=>($('#delete-dialog') as HTMLDialogElement).close();
 $('#delete-form').onsubmit=async e=>{e.preventDefault();try{const f=new FormData(e.target as HTMLFormElement);await api('/api/account','DELETE',{password:f.get('password')});($('#delete-dialog') as HTMLDialogElement).close();(e.target as HTMLFormElement).reset();clearToken();await refreshAccount();message('Your account and access credentials have been deleted.');}catch(err){$('#delete-error').textContent=(err as Error).message;}};
 if(new URLSearchParams(location.search).get('login')){(document.querySelector('[data-auth-mode="login"]') as HTMLButtonElement).click();setTimeout(()=>$('#account').scrollIntoView(),100);}
 void refreshAccount();
}
function clearToken(){($('#personal-token') as HTMLInputElement).value='';$('#token-reveal').hidden=true;}
export async function copy(text:string,button:HTMLElement){try{await navigator.clipboard.writeText(text);const label=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=label,2000);}catch{button.textContent='Select and copy the text';}}
