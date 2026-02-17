const data = {
  opening: {
    narrator: "Some people live. Some people perform. And some people—enter the Arena.",
    rival: "Relax. We can do this tomorrow."
  },
  prompts: [
    { id: "state", act: 1, narrator: "Choose your current state. Don’t decorate it. Name it.", options: ["Comfortable… but restless","Ambitious… but inconsistent","Talented… but distracted","Peaceful… but numb","Quiet… but dangerous"] },
    { id: "alive", act: 1, narrator: "When do you feel most alive?", options: ["When I’m building something real","When I’m admired","When I’m alone and locked in","When I’m exploring new places","When I’m arguing for truth"] },
    { id: "crown", act: 1, narrator: "Your attention is your crown. Who’s been wearing it?", options: ["My goals","My fears","Other people’s opinions","My cravings","My responsibilities"] },
    { id: "enemy", act: 2, narrator: "Pick the enemy you pretend doesn’t exist.", options: ["Comfort that feels ‘earned’","Fear dressed as ‘logic’","People pleasing","Perfectionism","Distraction (the friendly assassin)"] },
    { id: "truth", act: 2, timed: 7, narrator: "You have 7 seconds. Choose your truth.", timeoutNarrator: "No choice… is a choice.", timeoutRival: "See? We’re consistent.", options: ["I want impact, not applause","I want money, but I avoid risk","I want discipline, but I love comfort","I want peace, but I feed chaos","I want faith, but I forget purpose"] },
    { id: "hard", act: 2, narrator: "What do you do when it gets hard?", options: ["I disappear","I negotiate with my standards","I seek validation","I grind silently","I restart… again"] },
    { id: "noJudgment", act: 3, narrator: "What would you do if nobody could judge you?", options: ["Build the thing I keep delaying","Speak the truth I keep swallowing","Become disciplined—quietly","Leave the crowd and level up","Lead"] },
    { id: "method", act: 3, narrator: "Choose your method.", options: ["Loud confidence","Silent execution","Strategic patience","Controlled chaos","Faith + work (no drama)"] },
    { id: "responsibility", act: 3, narrator: "Final question: who’s responsible for your life?", options: ["Me. Completely.","Allah gave me a path, I must walk it.","My past shaped me, but it won’t lead me.","The system made it harder, but not impossible.","I don’t know yet… but I’m ready to learn."] }
  ],
  archetypes: {
    "The Sleeping Strategist": { reveal: "You’re not lazy. You’re under-activated.", strength: "Your mind is a blueprint machine.", blind: "You confuse planning with progress.", move: "Ship something ugly in 48 hours.", roast: "Your notes app is a museum.", epic: "Strategy without action is just a lullaby." },
    "The Distracted Warrior": { reveal: "You have fire… and no container.", strength: "High energy, high potential.", blind: "You leak power through distraction.", move: "Two hours daily, phone in another room.", roast: "You’re loyal to your dreams… in theory.", epic: "Aim your fire, and you become unstoppable." },
    "The Hidden Architect": { reveal: "You’re building quietly… but hiding loudly.", strength: "You can create systems that win.", blind: "You delay visibility to avoid judgment.", move: "Publish one thing weekly—no negotiations.", roast: "Your talent is private like it’s classified.", epic: "Your work deserves daylight." },
    "The Comfortable Spectator": { reveal: "You don’t lack ability. You lack urgency.", strength: "You’re stable, aware, and capable.", blind: "Comfort has sedated your hunger.", move: "Choose one hard thing daily.", roast: "You’re watching your own life like a series.", epic: "You were not born to observe." },
    "The Silent Operator": { reveal: "You move in quiet… and you mean it.", strength: "Discipline, execution, composure.", blind: "You isolate too much.", move: "Build + connect: one outreach daily.", roast: "You’re so private even your goals don’t know you.", epic: "Silence is power—when it ships results." }
  }
};

const weights = {
  state: [["The Comfortable Spectator",2],["The Sleeping Strategist",1]],
  alive: [["The Hidden Architect",2],["The Distracted Warrior",1]],
  crown: [["The Silent Operator",2],["The Distracted Warrior",2]],
  enemy: [["The Comfortable Spectator",2],["The Distracted Warrior",2]],
  truth: [["The Hidden Architect",2],["The Sleeping Strategist",1]],
  hard: [["The Sleeping Strategist",1],["The Silent Operator",2]],
  noJudgment: [["The Hidden Architect",2],["The Silent Operator",2]],
  method: [["The Distracted Warrior",1],["The Silent Operator",2]],
  responsibility: [["The Silent Operator",2],["The Hidden Architect",1]]
};
const optionMap = {
  state:["The Comfortable Spectator","The Hidden Architect","The Distracted Warrior","The Sleeping Strategist","The Silent Operator"],
  alive:["The Hidden Architect","The Comfortable Spectator","The Silent Operator","The Distracted Warrior","The Sleeping Strategist"],
  crown:["The Silent Operator","The Sleeping Strategist","The Hidden Architect","The Distracted Warrior","The Comfortable Spectator"],
  enemy:["The Comfortable Spectator","The Sleeping Strategist","The Hidden Architect","The Silent Operator","The Distracted Warrior"],
  truth:["The Hidden Architect","The Comfortable Spectator","The Distracted Warrior","The Sleeping Strategist","The Silent Operator"],
  hard:["The Sleeping Strategist","The Comfortable Spectator","The Hidden Architect","The Silent Operator","The Distracted Warrior"],
  noJudgment:["The Hidden Architect","The Sleeping Strategist","The Silent Operator","The Distracted Warrior","The Comfortable Spectator"],
  method:["The Distracted Warrior","The Silent Operator","The Hidden Architect","The Sleeping Strategist","The Comfortable Spectator"],
  responsibility:["The Silent Operator","The Hidden Architect","The Sleeping Strategist","The Comfortable Spectator","The Distracted Warrior"]
};

const state = {
  idx: 0,
  minigameDone: false,
  answers: {},
  scores: Object.fromEntries(Object.keys(data.archetypes).map(a => [a, 0])),
  badges: new Set(),
  gameScore: 0,
  muted: localStorage.getItem("arenaMuted") === "1",
  cinematic: false,
  easterClicks: 0,
  quoteMode: "epic"
};

const el = Object.fromEntries([...document.querySelectorAll("[id]")].map(n => [n.id, n]));
const scenes = ["landing","promptScene","minigameScene","resultScene","endingScene"];

function showScene(id){ scenes.forEach(s=>el[s].classList.toggle("active", s===id)); }
function typewriter(target, text, cb){
  target.textContent = "";
  let i = 0, skip = false;
  const skipFn = (e)=>{ if(e.key === "Enter") skip = true; };
  document.addEventListener("keydown", skipFn);
  const iv = setInterval(()=>{
    if(skip){ target.textContent = text; clearInterval(iv); done(); return; }
    target.textContent += text[i++] || "";
    if(i > text.length){ clearInterval(iv); done(); }
  }, 24);
  function done(){ document.removeEventListener("keydown", skipFn); cb?.(); }
}

function playClick(){ if(state.muted) return; tone(780, 0.04, "square", 0.04); }
function playWhoosh(){ if(state.muted) return; noise(0.22, 0.16); }
let ctx;
function audioCtx(){ if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
function tone(freq, dur, type="sine", gain=.08){
  const c = audioCtx(), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = 0;
  o.connect(g); g.connect(c.destination); o.start();
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.stop(c.currentTime + dur);
}
function noise(dur=.3,gain=.08){
  const c = audioCtx(), buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const out = buffer.getChannelData(0);
  for(let i=0;i<out.length;i++) out[i] = (Math.random()*2-1) * (1 - i/out.length);
  const n = c.createBufferSource(), g = c.createGain();
  n.buffer = buffer; g.gain.value = gain; n.connect(g); g.connect(c.destination); n.start();
}
function startAmbience(){
  if(state.muted) return;
  const c = audioCtx();
  [55, 82.41].forEach((f,i)=>{
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.value = f; g.gain.value = 0.01 + i*0.004;
    o.connect(g); g.connect(c.destination); o.start();
    state[`amb${i}`] = o;
  });
}
function stopAmbience(){ [state.amb0,state.amb1].forEach(o=>o?.stop?.()); state.amb0 = state.amb1 = null; }

function renderLanding(){
  showScene("landing");
  typewriter(el.narratorLine, data.opening.narrator);
  setTimeout(()=> el.rivalLine.textContent = data.opening.rival, 700);
}

function branchPrompt(prompt){
  if(prompt.id === "enemy" && state.answers.crown === "My goals") return { ...prompt, narrator: "Your crown leaned toward goals. What threat still sneaks in through the side door?" };
  if(prompt.id === "method" && state.answers.hard === "I grind silently") return { ...prompt, narrator: "You grind in silence. Now choose your operating system." };
  return prompt;
}

let timerInt;
function renderPrompt(){
  if(state.idx === 6 && !state.minigameDone){
    startMinigame();
    return;
  }
  const p = branchPrompt(data.prompts[state.idx]);
  if(!p){ renderResults(); return; }
  showScene("promptScene");
  el.actTitle.textContent = `Act ${p.act}: ${["","Awakening","Trial","Verdict"][p.act]}`;
  el.rivalPop.textContent = ["Cute answer incoming.","Be honest. It’s faster.","No pressure. Just your entire identity."][Math.floor(Math.random()*3)];
  typewriter(el.promptNarrator, p.narrator);
  el.options.innerHTML = "";
  if(p.timed){
    let t = p.timed;
    el.timerWrap.classList.remove("hidden"); el.timer.textContent = t;
    timerInt = setInterval(()=>{
      t -= 1; el.timer.textContent = t;
      if(t<=0){ clearInterval(timerInt); state.answers[p.id] = "[timeout]"; playWhoosh();
        el.promptNarrator.textContent = p.timeoutNarrator; el.rivalPop.textContent = p.timeoutRival; setTimeout(()=>{ state.idx++; updateIntensity(); renderPrompt(); }, 1000);
      }
    },1000);
  } else el.timerWrap.classList.add("hidden");

  p.options.forEach((op,i)=>{
    const b = document.createElement("button");
    b.className = "option-btn"; b.textContent = op;
    b.onclick = ()=> selectOption(p, i, op);
    el.options.appendChild(b);
  });
}

function selectOption(prompt, index, op){
  clearInterval(timerInt);
  const buttons = el.options.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);
  playClick();
  state.answers[prompt.id] = op;
  const base = optionMap[prompt.id][index];
  state.scores[base] += 2;
  (weights[prompt.id]||[]).forEach(([a,v]) => state.scores[a] += v * (index===0 ? 1 : 0.5));
  if(["I want impact, not applause","Me. Completely.","Build the thing I keep delaying"].includes(op)) state.badges.add("Truth-Teller");
  if(["Silent execution","I grind silently","When I’m alone and locked in"].includes(op)) state.badges.add("Silent Blade");
  state.idx += 1;
  updateIntensity();
  playWhoosh();
  renderPrompt();
}

function updateIntensity(){ el.intensityBar.value = Math.min(100, Math.round((state.idx/9)*100)); }

function startMinigame(){
  showScene("minigameScene");
  el.minigameNarrator.textContent = "Now the real boss fight: your attention.";
  el.minigameRival.textContent = "This is basically your daily life but with better graphics.";
  let score = 0, t = 6;
  el.gameScore.textContent = 0;
  const spawner = setInterval(()=> spawnDistraction(()=>{ score++; state.gameScore = score; el.gameScore.textContent = score; impact("FOCUS +1"); }), 320);
  const tick = setInterval(()=>{ t -= 0.1; el.gameTime.textContent = t.toFixed(1); if(t<=0){ clearInterval(spawner); clearInterval(tick); endMinigame(score);} },100);
}

function spawnDistraction(onHit){
  const icon = ["📱","📺","🍟","💬","🎮","🛌"][Math.floor(Math.random()*6)];
  const d = document.createElement("button"); d.className = "distraction"; d.textContent = icon;
  d.style.left = Math.random()*88 + "%"; d.style.top = Math.random()*82 + "%";
  d.onclick = ()=>{ onHit(); playClick(); d.remove(); el.gameArea.classList.add("shake"); setTimeout(()=>el.gameArea.classList.remove("shake"),150); };
  el.gameArea.appendChild(d); setTimeout(()=>d.remove(),900);
}
function impact(text){ el.impactText.textContent = text; setTimeout(()=>el.impactText.textContent = "",260); }

function endMinigame(score){
  el.gameArea.innerHTML = "";
  state.minigameDone = true;
  if(score >= 10) { state.scores["The Silent Operator"] += 2; state.badges.add("Distraction Slayer"); }
  else if(score >= 6) state.scores["The Hidden Architect"] += 1;
  else state.scores["The Distracted Warrior"] += 2;
  if(Object.values(state.answers).filter(v=>typeof v==="string" && !v.includes("timeout")).length >= 7) state.badges.add("Momentum");
  setTimeout(()=>{ renderResults(); },700);
}

function topArchetype(){
  return Object.entries(state.scores).sort((a,b)=>b[1]-a[1])[0][0];
}

function renderResults(){
  showScene("resultScene");
  const a = topArchetype();
  state.archetype = a;
  const info = data.archetypes[a];
  el.archetypeTitle.textContent = a;
  el.resultDetails.innerHTML = `
    <p><strong>Reveal:</strong> ${info.reveal}</p>
    <p><strong>Strength:</strong> ${info.strength}</p>
    <p><strong>Blind spot:</strong> ${info.blind}</p>
    <p><strong>Arena Move:</strong> ${info.move}</p>
    <p><strong>Roast:</strong> ${info.roast}</p>
    <p><strong>Epic:</strong> ${info.epic}</p>
    <p><strong>Scoring transparency:</strong> Base points from each choice + weighted modifiers + mini-game bonus.</p>`;
  el.badges.innerHTML = "";
  [...state.badges].forEach(b=>{ const n=document.createElement("div"); n.className="badge"; n.textContent = `🏅 ${b}`; el.badges.appendChild(n); });
}

function letterAndProtocol(){
  const a = state.archetype;
  const core = data.archetypes[a];
  const alive = state.answers.alive || "when you feel a spark";
  const enemy = state.answers.enemy || "comfort loops";
  const letter = `Future You speaking: I watched you choose ${alive.toLowerCase()} and finally call out ${enemy.toLowerCase()}. Keep going. ${core.epic} Start before you feel ready, then refine in motion.`;
  const protocol = [
    "Wake up same time daily (+/-30 mins). No phone first 20 minutes.",
    "90-minute deep work block on one meaningful build.",
    "One hard action before noon (message, publish, or pitch).",
    "Move body 20+ minutes to reset attention.",
    "Night review: 3 wins, 1 correction, tomorrow's first move."
  ];
  return { letter, protocol: Array.from({length:30}, (_,i)=>`Day ${i+1}: ${protocol[i%protocol.length]}`) };
}

function renderEnding(choice){
  showScene("endingScene");
  const { letter, protocol } = letterAndProtocol();
  state.letter = letter; state.protocol = protocol;
  if(choice === "comfort"){
    el.endingContent.innerHTML = `<p class="narrator">No shame. Comfort is a warm bed.</p>
    <p class="rival">Yes! Finally. We can breathe.</p>
    <p class="narrator">Just remember… comfort charges interest.</p>`;
  } else {
    el.endingContent.innerHTML = `<h3>${state.archetype}</h3><p>${letter}</p><h4>30-Day Arena Protocol</h4><ul>${protocol.slice(0,10).map(x=>`<li>${x}</li>`).join("")}</ul><p>Unlocked badges: ${[...state.badges].join(", ") || "None yet"}</p>`;
  }
  drawShareCard();
}

function drawShareCard(){
  const c = el.shareCard, g = c.getContext("2d"), i = data.archetypes[state.archetype];
  g.fillStyle = "#0b0b0b"; g.fillRect(0,0,c.width,c.height);
  const grad = g.createLinearGradient(0,0,c.width,c.height); grad.addColorStop(0,"#1d1306"); grad.addColorStop(1,"#050505"); g.fillStyle = grad; g.fillRect(40,40,c.width-80,c.height-80);
  g.strokeStyle = "#c99b45"; g.lineWidth = 4; g.strokeRect(40,40,c.width-80,c.height-80);
  g.fillStyle = "#f0d39d"; g.font = "700 72px Cinzel"; g.fillText("THE ARENA", 100, 180);
  g.font = "700 58px Inter"; wrapText(g, state.archetype, 100, 300, 860, 68);
  g.font = "500 42px Inter"; wrapText(g, state.quoteMode === "epic" ? i.epic : i.roast, 100, 440, 860, 56);
  g.strokeStyle = "#f0d39d"; g.lineWidth = 8; g.beginPath();
  for(let k=0;k<6;k++){ const a = k*Math.PI/3; const r = 120 + (k%2)*26; const x = 540 + Math.cos(a)*r; const y = 980 + Math.sin(a)*r; k?g.lineTo(x,y):g.moveTo(x,y); }
  g.closePath(); g.stroke(); g.font = "500 28px Inter"; g.fillText("Identity Awakening Simulator", 320, 1220);
}
function wrapText(g, txt, x, y, max, lh){
  let line=""; txt.split(" ").forEach(w=>{ const t = line+w+" "; if(g.measureText(t).width > max){ g.fillText(line, x, y); y += lh; line = w+" "; } else line=t; }); g.fillText(line,x,y);
}

function downloadCard(){
  const a = document.createElement("a"); a.href = el.shareCard.toDataURL("image/png"); a.download = "arena-share-card.png"; a.click();
}
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.setFontSize(18); pdf.text("THE ARENA Protocol", 14, 20);
  pdf.setFontSize(13); pdf.text(`Archetype: ${state.archetype}`, 14, 32);
  pdf.setFontSize(11); pdf.text("Future Self Letter:", 14, 42); pdf.text(pdf.splitTextToSize(state.letter, 180), 14, 49);
  pdf.text("30-Day Protocol:", 14, 88); pdf.text(pdf.splitTextToSize(state.protocol.join("\n"), 180), 14, 95);
  pdf.text(`Badges: ${[...state.badges].join(", ") || "None"}`, 14, 270);
  pdf.save("arena-protocol.pdf");
}

function initParticles(){
  const c = el.particles, g = c.getContext("2d");
  const resize=()=>{ c.width = innerWidth; c.height = innerHeight; }; resize(); addEventListener("resize", resize);
  const p = Array.from({length:70},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:Math.random()*.3,vy:-.2-Math.random()*.3,r:Math.random()*2+0.5}));
  (function run(){ g.clearRect(0,0,c.width,c.height); p.forEach(o=>{ o.x += o.vx; o.y += o.vy; if(o.y<0) o.y=c.height; if(o.x>c.width) o.x=0; g.fillStyle = "rgba(240,185,88,.35)"; g.beginPath(); g.arc(o.x,o.y,o.r,0,Math.PI*2); g.fill(); }); requestAnimationFrame(run); })();
}

function initParallax(){
  addEventListener("mousemove", e=>{
    const x = (e.clientX/innerWidth-.5)*8, y = (e.clientY/innerHeight-.5)*8;
    el.app.style.transform = `rotateX(${(-y).toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
  });
  addEventListener("deviceorientation", e=>{ if(e.gamma==null) return; el.app.style.transform = `rotateY(${(e.gamma/8).toFixed(2)}deg) rotateX(${(e.beta/-12).toFixed(2)}deg)`; });
}

function reset(){
  Object.assign(state, { idx:0, minigameDone:false, answers:{}, scores:Object.fromEntries(Object.keys(data.archetypes).map(a=>[a,0])), badges:new Set(state.easterClicks>=5?["Awakened"]:[]), gameScore:0, archetype:null });
  el.intensityBar.value = 0;
  renderLanding();
}

el.startBtn.onclick = async ()=>{ playWhoosh(); await audioCtx().resume(); startAmbience(); renderPrompt(); };
el.soundToggle.onclick = ()=>{ state.muted = !state.muted; localStorage.setItem("arenaMuted", state.muted ? "1":"0"); el.soundToggle.textContent = state.muted ? "🔇 Muted" : "🔊 Sound"; if(state.muted) stopAmbience(); else startAmbience(); };
el.cinematicToggle.onclick = ()=>{ state.cinematic = !state.cinematic; el.cinematicOverlay.classList.toggle("active", state.cinematic); el.cinematicToggle.setAttribute("aria-pressed", String(state.cinematic)); };
el.comfortBtn.onclick = ()=> renderEnding("comfort");
el.arenaBtn.onclick = ()=> renderEnding("arena");
el.downloadCardBtn.onclick = downloadCard;
el.downloadPdfBtn.onclick = downloadPDF;
el.replayBtn.onclick = ()=>{ stopAmbience(); reset(); };
el.toggleQuoteBtn.onclick = ()=>{ state.quoteMode = state.quoteMode === "epic" ? "roast" : "epic"; el.toggleQuoteBtn.textContent = state.quoteMode === "epic" ? "Use Roast Line" : "Use Epic Line"; drawShareCard(); };
el.arenaTitle.onclick = ()=>{ state.easterClicks++; if(state.easterClicks >= 5){ el.easterEggMsg.classList.remove("hidden"); state.badges.add("Awakened"); } };

initParticles();
initParallax();
el.soundToggle.textContent = state.muted ? "🔇 Muted" : "🔊 Sound";
renderLanding();
