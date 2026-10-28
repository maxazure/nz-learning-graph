export async function copy(text:string,button:HTMLElement){
 try{
  await navigator.clipboard.writeText(text);
  const label=button.textContent;button.textContent='Copied';
  setTimeout(()=>{if(button.isConnected)button.textContent=label;},2000);
 }catch{
  // Clipboard access can be denied. Present the actual text so manual copying
  // remains possible, rather than asking the user to select invisible content.
  button.nextElementSibling?.matches('.copy-fallback')&&button.nextElementSibling.remove();
  const field=document.createElement('textarea');
  field.className='copy-fallback';field.readOnly=true;field.rows=3;field.value=text;
  field.setAttribute('aria-label',document.documentElement.lang==='zh-CN'?'请选中文字并复制':'Select and copy the text');field.setAttribute('translate','no');
  button.insertAdjacentElement('afterend',field);button.textContent='Select and copy the text';
  field.focus();field.select();
 }
}
