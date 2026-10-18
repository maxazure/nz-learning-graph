/** Keep each video's narration, burned-in subtitles and poster in the selected language. */
export function setupParentVideo() {
 const videos = [
  {id:'parent-video',fallback:'video-fallback',duration:'video-duration',stem:'parents-star-map',times:{zh:'2:19',en:'2:26'}},
  {id:'cross-subject-video',fallback:'cross-subject-fallback',duration:'cross-subject-duration',stem:'cross-subject',times:{zh:'2:09',en:'2:36'}},
 ].map(config => ({...config,
  video:document.querySelector<HTMLVideoElement>(`#${config.id}`)!,
  link:document.querySelector<HTMLAnchorElement>(`#${config.fallback}`)!,
  label:document.querySelector<HTMLElement>(`#${config.duration}`)!,
 }));
 for (const {video,label} of videos) {
  video.addEventListener('loadedmetadata', () => {
   if (Number.isFinite(video.duration)) {
    const seconds=Math.round(video.duration);
    label.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
   }
  });
 }
 const update = () => {
  const language = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
  for (const {video,link,label,stem,times} of videos) {
   const src = `/videos/${stem}-${language}.mp4`;
   if (video.getAttribute('src') !== src) {
    video.pause();
    video.poster = `/videos/${stem}-${language}.jpg`;
    video.src = src;
    video.load();
   }
   video.lang = language === 'zh' ? 'zh-CN' : 'en-NZ';
   link.href = src;
   label.textContent = times[language];
  }
 };
 window.addEventListener('site-language-change', update);
 update();
}
