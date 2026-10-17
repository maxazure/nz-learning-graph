type Client = 'chatgpt' | 'claude' | 'codex' | 'claude-code' | 'workbuddy';
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const link = (url: string, label: string) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
const verification = 'Use search_topics to find fractions. Choose one topic and show its prerequisites using the available learning-graph tools. Explain one short parent-led activity for a Year 4 learner, cite the source and tell me whether the NZ mapping is teacher-reviewed. Do not ask for the child’s name, school or other identifying information.';

export function setupConnections() {
 const guide = document.querySelector<HTMLElement>('#connection-guide');
 const tabs = document.querySelector<HTMLElement>('#client-tabs');
 if (!guide || !tabs) return;
 const endpoint = `${location.origin}/mcp`;
 const blocks: string[] = [];
 const code = (value: string, label = 'Copy configuration') => {
  const index = blocks.push(value) - 1;
  return `<div class="connection-code"><pre tabindex="0"><code>${escapeHtml(value)}</code></pre><button type="button" class="button button-secondary" data-copy-connection="${index}">${escapeHtml(label)}</button></div>`;
 };
 const render = (client: Client) => {
  blocks.length = 0;
  for (const button of tabs.querySelectorAll<HTMLButtonElement>('[data-client]')) {
   const active = button.dataset.client === client;
   button.setAttribute('aria-selected', String(active));
   button.classList.toggle('active', active);
   button.tabIndex=active?0:-1;
   button.id='client-tab-'+button.dataset.client;
   button.setAttribute('aria-controls','connection-guide');
   if(active)guide.setAttribute('aria-labelledby',button.id);
  }
  let body = '';
  if (client === 'chatgpt') body = `<h3>Connect with ChatGPT</h3>
   <ol class="connection-steps"><li>Create a parent account here, then open ChatGPT’s custom MCP / developer-mode settings. Availability depends on your account and workspace settings.</li><li>Create a custom connection named NZ Learning Graph, paste the server URL below and choose OAuth authentication.</li><li>Use automatic registration if offered; this server advertises an OAuth registration endpoint. Follow the browser sign-in and consent screen using your parent account.</li><li>Enable the connection in a conversation and try the check below.</li></ol>
   ${code(endpoint, 'Copy server URL')}
   <p class="connection-note">If custom connections are unavailable, check your workspace permissions. This is a custom connection, not a published ChatGPT directory listing.</p>
   <p>${link('https://developers.openai.com/plugins/deploy/connect-chatgpt', 'OpenAI connection and testing guide')} · ${link('https://developers.openai.com/plugins/build/auth', 'OAuth and automatic registration')}</p>`;
  if (client === 'claude') body = `<h3>Connect with Claude</h3>
   <ol class="connection-steps"><li>In Claude, open Customize → Connectors → Add → Custom → Web. A managed workspace may need an administrator to add it.</li><li>Name it NZ Learning Graph and paste the server URL below.</li><li>Choose Sign in now and, under OAuth client, Register automatically. Complete sign-in and consent with your parent account.</li><li>In a conversation, use the + menu → Connectors and enable NZ Learning Graph.</li></ol>
   ${code(endpoint, 'Copy server URL')}
   <p>${link('https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp', 'Claude custom connector guide')}</p>`;
  if (client === 'codex') body = `<h3>Connect with Codex</h3><p>For browser sign-in, run these commands in your terminal:</p>
   ${code(`codex mcp add nz-learning --url ${endpoint}\ncodex mcp login nz-learning`, 'Copy commands')}
   <p>Approve access with your parent account. In Codex, use <code>/mcp</code> to check the connection.</p>
   <details><summary>Use a personal connection key instead</summary><p>Create a key in your account above. Set <code>NZ_LEARNING_TOKEN</code> in the environment that launches Codex, then add this to <code>~/.codex/config.toml</code>. Keep the key out of shared files and chat messages. Use either this method or browser sign-in.</p>
   ${code(`[mcp_servers.nz-learning]\nurl = "${endpoint}"\nbearer_token_env_var = "NZ_LEARNING_TOKEN"`)}
   </details><p>${link('https://developers.openai.com/codex/mcp', 'Codex MCP configuration guide')}</p>`;
  if (client === 'claude-code') body = `<h3>Connect with Claude Code</h3><p>Run this command from your terminal:</p>
   ${code(`claude mcp add --transport http nz-learning ${endpoint}`, 'Copy command')}
   <ol class="connection-steps"><li>Open Claude Code and enter <code>/mcp</code>.</li><li>Select NZ Learning Graph / nz-learning and authenticate through the browser.</li><li>Sign in with your parent account, approve access, then check the server is connected.</li></ol>
   <p>${link('https://code.claude.com/docs/en/mcp', 'Claude Code MCP guide')}</p>`;
  if (client === 'workbuddy') {
   const config = {mcpServers:{'nz-learning':{command:'npx',args:['-y','mcp-remote@0.15.1',endpoint,'--transport','http-only','--header','Authorization: Bearer ${NZ_LEARNING_TOKEN}'],env:{NZ_LEARNING_TOKEN:'PASTE_YOUR_PERSONAL_CONNECTION_KEY_HERE'}}}};
   body = `<h3>Connect with WorkBuddy through a local bridge</h3><p class="connection-note">WorkBuddy documents local stdio configuration. This example uses the third-party mcp-remote bridge to reach our HTTP server. The bridge has passed a live tool-call test; the WorkBuddy app itself has not been tested.</p>
    <ol class="connection-steps"><li>Install Node.js 18 or newer if needed. The first run of <code>npx</code> downloads the named bridge package.</li><li>Create a personal connection key in your account above.</li><li>Merge this entry into <code>~/.workbuddy/mcp.json</code>, preserving existing servers. Replace only the placeholder value in <code>env</code> with your key. Keep this local file private.</li><li>Reload WorkBuddy’s MCP configuration and enable nz-learning. If it fails, check Node.js, the key and the WorkBuddy documentation.</li></ol>
    ${code(JSON.stringify(config, null, 2))}
    <p>${link('https://www.workbuddy.ai/docs/zh/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide', 'WorkBuddy MCP guide')} · ${link('https://github.com/geelen/mcp-remote', 'mcp-remote bridge documentation')}</p>`;
  }
  guide.innerHTML = `<div class="connection-content">${body}<div class="connection-check"><h4>Check your connection</h4><p>Ask your AI tool:</p>${code(verification, 'Copy test prompt')}<p>It should call the learning-graph tools and return topic IDs or source links. If it only gives a general answer, ask it to use the connection explicitly.</p></div><p class="connection-status">Setup instructions checked 18 October 2026. The official MCP SDK, Claude Code with a personal key, and the WorkBuddy stdio bridge have passed live tool-call tests. ChatGPT/Claude browser sign-in and the WorkBuddy app remain untested. Your AI provider’s subscription, permissions and data policies apply.</p><p class="connection-copy-status" role="status" aria-live="polite"></p></div>`;
  for (const button of guide.querySelectorAll<HTMLButtonElement>('[data-copy-connection]')) button.onclick = async () => {
   const value = blocks[Number(button.dataset.copyConnection)];
   const status = guide.querySelector<HTMLElement>('.connection-copy-status');
   try {
    await navigator.clipboard.writeText(value);
    if (status) status.textContent = 'Copied.';
   } catch {
    const codeElement = button.parentElement?.querySelector('code');
    if (codeElement) { const range = document.createRange(); range.selectNodeContents(codeElement); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); }
    if (status) status.textContent = 'Clipboard access was unavailable. The text is selected; use your device’s Copy command.';
   }
  };
 };
 for (const button of tabs.querySelectorAll<HTMLButtonElement>('[data-client]')) button.onclick = () => {
  const client = button.dataset.client;
  if (client && ['chatgpt','claude','codex','claude-code','workbuddy'].includes(client)) render(client as Client);
 };
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=[...tabs.querySelectorAll<HTMLButtonElement>('[data-client]')];const index=buttons.findIndex(b=>b.getAttribute('aria-selected')==='true');const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 render('chatgpt');
}
