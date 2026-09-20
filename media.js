// Coordinate official player APIs with the native Maiwai audio player.
const audio=document.querySelector('audio');
const session=document.querySelector('.session');
const youtubePlayers=new Set();
let soundcloudWidget=null, soundcloudReady=false, activeMedia=null, launchRequest=0;
function setSessionPlaying(playing){session.classList.toggle('is-playing',playing)}
function pauseOthers(current){
 activeMedia=current;
 if(current!==audio)audio.pause();
 if(current!==soundcloudWidget&&soundcloudReady)soundcloudWidget.pause();
 youtubePlayers.forEach(record=>{if(record!==current)record.player?.pauseVideo()});
 setSessionPlaying(current===audio&&!audio.paused&&!audio.ended || youtubePlayers.has(current)&&current.festival&&current.playing);
}
function loadPlayerScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script)})}
let youtubeReady;
function getYouTube(){
 if(window.YT?.Player)return Promise.resolve();
 if(!youtubeReady)youtubeReady=new Promise((resolve,reject)=>{
  window.onYouTubeIframeAPIReady=resolve;
  loadPlayerScript('https://www.youtube.com/iframe_api').catch(()=>{youtubeReady=null;reject(new Error('YouTube player unavailable'))});
 });
 return youtubeReady;
}
loadPlayerScript('https://w.soundcloud.com/player/api.js').then(()=>{
 soundcloudWidget=SC.Widget(document.querySelector('.soundcloud-player'));
 soundcloudWidget.bind(SC.Widget.Events.READY,()=>{soundcloudReady=true;if(activeMedia&&activeMedia!==soundcloudWidget)soundcloudWidget.pause()});
 soundcloudWidget.bind(SC.Widget.Events.PLAY,()=>{soundcloudReady=true;launchRequest++;pauseOthers(soundcloudWidget)});
}).catch(()=>{/* The embedded player and its direct link remain available. */});
audio.addEventListener('play',()=>{launchRequest++;pauseOthers(audio);setSessionPlaying(false)});
audio.addEventListener('playing',()=>{pauseOthers(audio);setSessionPlaying(true)});
['pause','ended','waiting','error'].forEach(event=>audio.addEventListener(event,()=>{if(activeMedia===audio)setSessionPlaying(false)}));
audio.addEventListener('error',()=>{document.querySelector('.audio-error').hidden=false});
async function launchYouTube(button,playlist=false){
 const request=++launchRequest;
 pauseOthers(null);
 button.disabled=true;button.setAttribute('aria-busy','true');
 try{
  await getYouTube();
  if(request!==launchRequest)return;
  const container=playlist?document.querySelector('.album-player'):button.parentElement;
  if(playlist){youtubePlayers.forEach(record=>{if(record.playlist){record.player.destroy();youtubePlayers.delete(record)}});container.hidden=false;container.replaceChildren()}
  const iframe=document.createElement('iframe');
  const resource=playlist?'videoseries?list='+encodeURIComponent(button.dataset.playlist):container.dataset.video+'?';
  iframe.src='https://www.youtube-nocookie.com/embed/'+resource+(playlist?'&':'')+'enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);
  iframe.title=playlist?'Can You Feel It? — The Gratoners':button.getAttribute('aria-label');
  iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;
  if(playlist)container.append(iframe);else button.replaceWith(iframe);
  const record={player:null,festival:!playlist&&container.dataset.video==='Gk-JT5TZY5U',playing:false,playlist};
  youtubePlayers.add(record);
  record.player=new YT.Player(iframe,{events:{
   onReady:event=>{if(request===launchRequest)event.target.playVideo()},
   onStateChange:event=>{
    record.playing=event.data===YT.PlayerState.PLAYING;
    if(record.playing){launchRequest++;pauseOthers(record)}
    else if(activeMedia===record)setSessionPlaying(false);
   },
   onError:()=>{record.playing=false;if(activeMedia===record)setSessionPlaying(false)}
  }});
  if(playlist)container.scrollIntoView({behavior:document.body.classList.contains('motion-off')?'instant':'smooth',block:'center'});
 }catch{/* Keep the original thumbnail and the adjacent YouTube link usable. */}
 finally{button.disabled=false;button.removeAttribute('aria-busy')}
}
document.querySelectorAll('.video-launch').forEach(button=>button.addEventListener('click',()=>launchYouTube(button)));
document.querySelector('.album-play').addEventListener('click',event=>launchYouTube(event.currentTarget,true));
