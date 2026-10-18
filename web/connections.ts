type Client = 'chatgpt' | 'claude' | 'codex' | 'claude-code' | 'workbuddy';
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const docs: Record<Client,string> = {
 chatgpt:'https://learn.chatgpt.com/docs/extend/mcp',
 claude:'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp',
 codex:'https://developers.openai.com/codex/mcp',
 'claude-code':'https://code.claude.com/docs/en/mcp',
 workbuddy:'https://www.workbuddy.ai/docs/zh/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide',
};
export function setupConnections() {
 const guide=document.querySelector<HTMLElement>('#connection-guide')!;
 const tabs=document.querySelector<HTMLElement>('#client-tabs')!;
 const endpoint=`${location.origin}/mcp`;
 let client:Client='chatgpt';
 const render=()=>{
  const zh=document.documentElement.lang==='zh-CN';
  const title:Record<Client,string>={chatgpt:'ChatGPT Work · desktop','claude-code':'Claude Code',workbuddy:'WorkBuddy',codex:'Codex',claude:'Claude · web & desktop'};
  for(const button of tabs.querySelectorAll<HTMLButtonElement>('[data-client]')){
   const active=button.dataset.client===client;button.setAttribute('aria-selected',String(active));button.classList.toggle('active',active);button.tabIndex=active?0:-1;button.id='client-tab-'+button.dataset.client;button.setAttribute('aria-controls','connection-guide');if(active)guide.setAttribute('aria-labelledby',button.id);
  }
  const intro=zh?`请帮我连接并使用免费的 NZ Learning Graph，辅助孩子学习。MCP 地址：${endpoint}，协议为 Streamable HTTP，无需本站账号、登录、API key 或 OAuth。`:`Help me connect and use the free NZ Learning Graph for learning at home. MCP endpoint: ${endpoint}. Transport: Streamable HTTP. No website account, sign-in, API key or OAuth is needed.`;
  const lesson=zh?'连接后，请实际调用 search_topics 搜索 "telling the time"，展示返回的知识点，再查询前置知识，带我们做一次 10 分钟的练习。一次问一个问题，等回答后再继续，先给提示。给家长的解释用中文，知识点名称、英文题目和孩子需要学习的英语保留英文。若工具尚不可用，请明确说明，不要声称已查询。':'After connecting, actually call search_topics for "telling the time" and show the returned topics. Check their prerequisites, then guide us through a 10-minute activity. Ask one question at a time, wait for the answer and give hints first. Use my language for parent explanations; keep learning topic names and English exercises in English. If the tools are unavailable, say so; do not claim to have queried them.';
  const preserve=zh?'请先检查已有配置，保留其他设置和 MCP 服务器，只添加或更新 nz-learning。需要应用权限、重新加载或重启会话时，请告诉我具体操作。完成配置后检查真实连接状态。':'Inspect the existing configuration first. Preserve other settings and MCP servers; add or update only nz-learning. Tell me if an app permission, reload or session restart is needed. Verify the actual connection after setup.';
  const bridge=JSON.stringify({mcpServers:{'nz-learning':{command:'npx',args:['-y','mcp-remote@0.15.1',endpoint,'--transport','http-only']}}},null,2);
  const config=`[mcp_servers.nz-learning]\nurl = "${endpoint}"`;
  const setup:Record<Client,string> = zh?{
   chatgpt:`我在 ChatGPT Work 桌面版。若你能操作本机配置，请将下方条目合并到 ~/.codex/config.toml：\n${config}\n如果已安装 Codex CLI，也可执行 codex mcp add nz-learning --url ${endpoint}。需要时提醒我重启 Work。若无法修改本机配置，请引导我到 Settings → MCP servers → Add server，填写地址并选择 Streamable HTTP。若当前为网页版 Work，请检查已安装插件是否提供此 MCP；没有时说明需要先添加对应插件，不要声称已安装。`,
   'claude-code':`请在终端中执行（若尚未配置）：\nclaude mcp add --transport http --scope user nz-learning ${endpoint}\n用 claude mcp get nz-learning 检查配置。若当前会话尚未加载工具，请提醒我重启后继续。`,
   codex:`请在终端中执行（若尚未配置）：\ncodex mcp add nz-learning --url ${endpoint}\n用 codex mcp list 检查配置。无需执行 mcp login。若当前会话尚未加载工具，请提醒我重启后继续。`,
   workbuddy:`请先检查 Node.js 和 npx 是否可用；如果缺少，请说明安装方法。把下面的服务器条目合并到用户级 ~/.workbuddy/mcp.json。此配置使用 mcp-remote 桥接工具，首次运行 npx 会下载它。\n${bridge}\n保存后检查 MCP 状态，必要时提醒我重新加载 WorkBuddy。`,
   claude:'请使用已经添加的 NZ Learning Graph 连接。如果尚未添加，请引导我到 Customize → Connectors → Add custom connector，填写上方地址，选择 No sign in，再在对话中启用它。不要声称仅靠这条聊天消息就修改了账号连接设置。',
  }:{
   chatgpt:`I am using ChatGPT Work on desktop. If you can edit local settings, merge this entry into ~/.codex/config.toml:\n${config}\nIf the Codex CLI is installed, you can instead run codex mcp add nz-learning --url ${endpoint}. Tell me to restart Work if needed. If you cannot edit local settings, guide me to Settings → MCP servers → Add server, enter the URL and choose Streamable HTTP. If this is web Work, check whether an installed plugin provides this MCP; otherwise explain that a suitable plugin must be added first, without claiming installation succeeded.`,
   'claude-code':`Run this terminal command if not already configured:\nclaude mcp add --transport http --scope user nz-learning ${endpoint}\nCheck with claude mcp get nz-learning. If tools are not loaded in this session, ask me to restart and continue.`,
   codex:`Run this terminal command if not already configured:\ncodex mcp add nz-learning --url ${endpoint}\nCheck with codex mcp list. Do not run mcp login. If tools are not loaded in this session, ask me to restart and continue.`,
   workbuddy:`Check that Node.js and npx are available; if missing, explain how to install them. Merge this server entry into the user-level ~/.workbuddy/mcp.json. It uses the mcp-remote bridge, which npx downloads on first use.\n${bridge}\nCheck MCP status after saving, and ask me to reload WorkBuddy if needed.`,
   claude:'Use the NZ Learning Graph connection already added to this account. If missing, guide me to Customize → Connectors → Add custom connector, enter the URL above, select No sign in and enable it in this conversation. Do not claim that this chat message alone changes account connector settings.',
  };
  const prompt=[intro,preserve,setup[client],lesson].join('\n\n');
  const continuation=zh?`请使用已连接的 NZ Learning Graph（${endpoint}）。${lesson}`:`Use the connected NZ Learning Graph (${endpoint}). ${lesson}`;
  let note='Paste this into a new conversation. Your AI can set up the connection if it has access to your local settings. Restart the app or session if it asks you to.';
  if(client==='chatgpt')note='For ChatGPT Work on desktop. Web Work uses plugins; the desktop configuration does not install a web plugin.';
  if(client==='claude')note='Add the connector once in Customize → Connectors using the server URL and No sign in. Then paste this prompt into a conversation with the connector enabled.';
  guide.innerHTML=`<div class="connection-content"><h3>${title[client]}</h3><p class="connection-note">${note}</p><button type="button" class="button" id="copy-setup">Copy setup prompt</button><p class="connection-copy-status" role="status" aria-live="polite"></p><details class="prompt-preview"><summary>Read the prompt</summary><pre translate="no"><code>${escapeHtml(prompt)}</code></pre></details><details><summary>Continue after restarting your AI</summary><p>Once the connection is ready, paste this to start learning.</p><button type="button" class="button secondary" id="copy-start">Copy learning prompt</button><pre translate="no"><code>${escapeHtml(continuation)}</code></pre></details><details><summary>Server details</summary><p>Public MCP · Streamable HTTP · No authentication</p><pre><code>${escapeHtml(endpoint)}</code></pre><button type="button" class="button secondary" id="copy-endpoint">Copy server URL</button><p><a href="${docs[client]}" target="_blank" rel="noopener noreferrer">Official setup guide</a></p></details></div>`;
  for(const [id,text] of [['copy-setup',prompt],['copy-start',continuation],['copy-endpoint',endpoint]]){
   guide.querySelector<HTMLButtonElement>('#'+id)!.onclick=async()=>{
    const status=guide.querySelector<HTMLElement>('.connection-copy-status')!;
    try{await navigator.clipboard.writeText(text);status.textContent='Copied. Paste it into your AI conversation.';}catch{status.textContent='Clipboard access was unavailable. Open Read the prompt and copy the text.';guide.querySelector<HTMLDetailsElement>('.prompt-preview')!.open=true;}
   };
  }
 };
 for(const button of tabs.querySelectorAll<HTMLButtonElement>('[data-client]'))button.onclick=()=>{client=button.dataset.client as Client;render();};
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=[...tabs.querySelectorAll<HTMLButtonElement>('[data-client]')];const index=buttons.findIndex(b=>b.getAttribute('aria-selected')==='true');const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 window.addEventListener('site-language-change',render);
 render();
}
