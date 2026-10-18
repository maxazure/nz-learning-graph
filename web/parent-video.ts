/** Keep the narration, burned-in subtitles and poster in the selected site language. */
export function setupParentVideo() {
 const video = document.querySelector<HTMLVideoElement>('#parent-video')!;
 const fallback = document.querySelector<HTMLAnchorElement>('#video-fallback')!;
 const duration = document.querySelector<HTMLElement>('#video-duration')!;
 const update = () => {
  const language = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
  const src = `/videos/parents-${language}.mp4`;
  if (video.getAttribute('src') !== src) {
   video.pause();
   video.poster = `/videos/parents-${language}.jpg`;
   video.src = src;
   video.load();
  }
  video.lang = language === 'zh' ? 'zh-CN' : 'en-NZ';
  fallback.href = src;
  duration.textContent = language === 'zh' ? '2:13' : '2:24';
 };
 window.addEventListener('site-language-change', update);
 update();
}
