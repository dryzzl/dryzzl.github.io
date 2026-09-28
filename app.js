'use strict';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const projects = [
  {
    id:'fall-detection', title:'Real-Time Fall Detection', category:'AI / COMPUTER VISION', filter:'ai', year:'2026', type:'Computer vision system',
    summary:'Understanding movement over time to detect a fall—and keep the alert active while someone remains on the ground.',
    stack:['Python','YOLO11-Pose','LSTM','ONNX'], fullStack:['Python','YOLO11-Pose','BoT-SORT','LSTM','ONNX Runtime'],
    highlight:'98.2% reported test accuracy', repo:null,
    problem:'A single frame can confuse a fall with sitting down, exercising, or bending over. A useful detector needs to understand the motion leading up to a fall and whether the person stays down.',
    approach:'Track each person across frames, extract five pose and motion features, and classify the sequence as Normal, Falling, or Fallen. A persistent alert carries the fallen state forward while the person remains on the ground.',
    decision:'Model movement as a sequence, then separate inference from the training framework with ONNX exports.',
    steps:[['Find and track each person','YOLO11-Pose provides body keypoints. BoT-SORT associates detections across frames so each person has a continuous motion history.'],['Reduce pose data to meaningful features','Body position, angle, shape, movement, and pose confidence describe how the person changes over time.'],['Classify temporal behavior','An LSTM processes the feature sequence to distinguish Normal, Falling, and Fallen states. Persistent fallen-state alerting keeps attention on an unresolved event.'],['Decouple training from inference','Export the pose model and classifier to ONNX. The described runtime pipeline uses ONNX Runtime without requiring PyTorch for inference.']],
    code:'camera frames → YOLO11-Pose → BoT-SORT\n              ↓\nposition · angle · shape · movement · confidence\n              ↓\nLSTM sequence classifier → Normal / Falling / Fallen\n              ↓\npersistent fallen-state alert',
    codeLabel:'PIPELINE / FROM THE PROJECT NOTES',
    metrics:[['98.2%','Test accuracy'],['97.8%','Macro F1'],['95.3%','Falling-state recall']],
    outcomes:['Three-state classification makes the distinction between a fall in progress and a person remaining on the ground explicit.','Multi-person tracking preserves individual motion histories across frames.','ONNX exports support an inference pipeline independent of PyTorch.'],
    resultNote:'Metrics are reported in Evan’s project notes for one test split. Dataset, split methodology, evaluation code, latency, and false-positive measurements have not been independently verified. These are research results, not clinical validation.',
    sourceNote:'Case study based on Evan’s project notes. Repository and original screenshots have not been supplied.',
    gallery:[{kind:'fall',title:'Pose tracking & state classification',caption:'Illustrative system view · not a captured model prediction.'},{kind:'pipeline',title:'Temporal inference pipeline',caption:'Architecture illustration based on the project notes.'}],
  },
  {
    id:'home-lab-monitor', title:'Home Lab Monitoring Dashboard', category:'SYSTEMS / OBSERVABILITY', filter:'systems', year:'2026', type:'Full-stack monitoring application',
    summary:'A clear view of machine health, connecting live hardware metrics to a lightweight, responsive dashboard.',
    stack:['Python','FastAPI','psutil','JavaScript'], fullStack:['Python','FastAPI','psutil','JavaScript','HTML / CSS'],
    highlight:'Live metrics · REST API', repo:'https://github.com/dryzzl/home-lab-monitor',
    problem:'System information is scattered across operating-system tools. I wanted one browser view of CPU, memory, disk, and uptime, backed by a simple API I could understand and extend.',
    approach:'Use psutil to collect the machine’s metrics, expose a flat JSON response through FastAPI, and refresh color-coded progress bars from JavaScript. Keep the frontend and backend in separate folders.',
    decision:'Keep the metrics response flat so the interface can consume each measurement directly.',
    steps:[['Collect host metrics','The /metrics route samples CPU utilization and collects physical core count, logical thread count, memory utilization, disk utilization, and uptime.'],['Publish a small API contract','FastAPI exposes a health message at / and a flat metrics object at /metrics. The checked-in backend reads the Windows C: drive for disk usage.'],['Translate values into an interface','JavaScript retrieves the JSON data and updates metric text and color-coded progress bars. HTML and CSS define the dashboard layout.'],['Keep the components understandable','Separate frontend and backend folders make it possible to inspect the data collection, API contract, and presentation independently.']],
    code:'GET /metrics\n{\n  "cpu_percent": 24.8,\n  "cpu_cores": 8,\n  "cpu_threads": 16,\n  "memory_percent": 42.1,\n  "disk_percent": 61.7,\n  "uptime_seconds": 43200\n}',
    codeLabel:'ILLUSTRATIVE RESPONSE / KEYS VERIFIED IN SOURCE',
    outcomes:['Source includes six metrics covering utilization, processor topology, and uptime.','The REST endpoint and browser interface create a complete path from hardware data to visual feedback.','A compact, flat response keeps the integration easy to inspect and extend.'],
    resultNote:'Implementation checked against the linked repository on September 16, 2026. Sample values in the portfolio are illustrative. No production uptime or load-test claims are made.',
    sourceNote:'Source reviewed: backend/main.py, frontend files, and README in the linked repository.',
    gallery:[{image:'/assets/home-lab-source.png',title:'Original dashboard · typical usage',caption:'Captured from the repository frontend with sample API data.'},{image:'/assets/home-lab-thresholds.png',title:'Original dashboard · threshold indicators',caption:'Captured with sample values to show warning and danger states.'},{kind:'contract',title:'Hardware metrics API contract',caption:'Response keys from the repository · values are sample data.'}],
  },
  {
    id:'task-manager-api', title:'Task Manager API', category:'BACKEND / API ENGINEERING', filter:'systems', year:'2026', type:'Authenticated REST API',
    summary:'A structured backend for user accounts and personal tasks, with JWT authentication and PostgreSQL persistence.',
    stack:['FastAPI','PostgreSQL','SQLAlchemy','JWT'], fullStack:['Python','FastAPI','PostgreSQL','SQLAlchemy','Pydantic','JWT'],
    highlight:'Auth + owner-scoped CRUD', repo:'https://github.com/dryzzl/task-manager-api',
    problem:'A task API needs more than create and delete endpoints. Users need persistent accounts, validated input, and access restricted to their own tasks.',
    approach:'Organize the application into models, schemas, authentication helpers, and route modules. Issue a bearer token at login and resolve the current user before each task operation.',
    decision:'Apply the current user’s ID inside database queries so task access is scoped at the data boundary.',
    steps:[['Model users and tasks','SQLAlchemy models define persistent entities, while Pydantic schemas describe accepted input and returned data.'],['Authenticate requests','The /auth/login endpoint verifies the supplied credentials and returns a JWT bearer token. Protected routes depend on get_current_user.'],['Scope every task operation','Task listing and individual task queries filter by owner_id. New tasks use the authenticated user as their owner.'],['Express REST behavior consistently','Create returns 201, delete returns 204, and missing or inaccessible individual tasks return 404. PATCH updates only fields included in the request.']],
    code:'POST   /auth/login        → bearer token\nPOST   /tasks             → 201 Created\nGET    /tasks             → your tasks\nGET    /tasks/{task_id}   → your task\nPATCH  /tasks/{task_id}   → partial update\nDELETE /tasks/{task_id}   → 204 No Content\n\nTask.owner_id == current_user.id',
    codeLabel:'ROUTES / VERIFIED IN THE REPOSITORY',
    outcomes:['Implemented JWT login and five task endpoints covering create, list, read, update, and delete.','Owner filtering is present in the checked-in task queries.','Typed schemas and separate route modules make validation and application structure explicit.'],
    resultNote:'Implementation checked against the linked repository on September 16, 2026. This source review does not establish production readiness or a completed security audit.',
    sourceNote:'Source reviewed: app/routes/tasks.py, app/routes/authentication.py, models, and schemas.',
    gallery:[{kind:'api',title:'API surface',caption:'Illustrative route explorer based on the checked-in endpoints.'},{kind:'ownership',title:'Ownership boundary',caption:'Architecture illustration · user-scoped task access.'}],
  },
  {
    id:'maplestory-bot', title:'MapleStory Discord Bot', category:'AUTOMATION / COMMUNITY', filter:'automation', year:'Personal project', type:'Asynchronous community tool',
    summary:'Game information, event notices, and player utilities brought together where the community already hangs out.',
    stack:['Python','discord.py','asyncio','Beautiful Soup'], fullStack:['Python','discord.py','asyncio','requests','Beautiful Soup'],
    highlight:'Commands · events · utilities', repo:null,
    problem:'Players have to check multiple websites for patch notes, events, reset information, and progression tools. The useful information rarely arrives in one place at the right time.',
    approach:'Bring game lookups, announcements, calculators, and event reminders into Discord commands. Retrieve information from web sources and APIs, then format it into a concise response.',
    decision:'Meet the user in the community’s existing workflow and automate the repeated information gathering.',
    steps:[['Connect commands to game information','Use discord.py to handle commands and respond with game news, class resources, event information, and player utilities.'],['Collect external information','Use requests for HTTP access and Beautiful Soup for extracting relevant information from HTML pages.'],['Coordinate asynchronous activity','Use async/await for command handling and concurrent bot activity, including event and maintenance notices.'],['Add useful player tools','Project notes describe progression calculators, reset and event information, and resource lookups that reduce repeated manual searching.']],
    code:'Discord command / scheduled notice\n               ↓\ncommand handler → game information / utilities\n               ↓\nAPI requests + HTML extraction\n               ↓\nformatted response → community channel',
    codeLabel:'INFORMATION FLOW / FROM THE PROJECT NOTES',
    outcomes:['One interaction point for game information, community notices, and player resources.','Automated reminders support recurring events and maintenance updates.','The project connects API integration, HTML extraction, asynchronous execution, and community-oriented interface design.'],
    resultNote:'Features are described in Evan’s project notes. Usage counts, uptime, command latency, and repository implementation have not been verified.',
    sourceNote:'Case study based on Evan’s project notes. Repository and original screenshots have not been supplied.',
    gallery:[{kind:'bot',title:'Command and response concept',caption:'Illustrative interface · sample commands and content, not a live bot session.'},{kind:'botflow',title:'Community information workflow',caption:'Architecture illustration based on the project notes.'}],
  },
];

function svgShell(content, title, viewBox='0 0 540 250') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${escapeHTML(title)}">${content}</svg>`;
}

function fallVisual() {
  let grid='';
  for(let x=30;x<540;x+=35) grid+=`<path d="M${x} 35V250" stroke="#22334e" opacity=".4"/>`;
  for(let y=40;y<250;y+=30) grid+=`<path d="M0 ${y}H540" stroke="#22334e" opacity=".4"/>`;
  const points=[[0,-44],[-15,-15],[15,-15],[-27,11],[29,9],[-32,35],[42,24],[-12,35],[12,35],[-17,67],[19,65],[-22,99],[29,94]];
  const lines=[[0,1],[0,2],[1,2],[1,3],[3,5],[2,4],[4,6],[1,7],[2,8],[7,8],[7,9],[9,11],[8,10],[10,12]];
  function pose(x,y,angle,color,opacity=1){return `<g transform="translate(${x} ${y}) rotate(${angle})" opacity="${opacity}">${lines.map(([a,b])=>`<path d="M${points[a]}L${points[b]}" stroke="${color}" stroke-width="2"/>`).join('')}${points.map(([px,py])=>`<circle cx="${px}" cy="${py}" r="3" fill="#101a29" stroke="${color}" stroke-width="1.5"/>`).join('')}<circle cx="0" cy="-44" r="11" fill="none" stroke="${color}" stroke-width="1" opacity=".45"/></g>`}
  return svgShell(`<defs><radialGradient id="fallGlow"><stop stop-color="#254a7c" stop-opacity=".55"/><stop offset="1" stop-color="#101622"/></radialGradient></defs><rect width="540" height="250" fill="url(#fallGlow)"/>${grid}<path d="M28 211H512" stroke="#3f5777"/>${pose(129,94,0,'#587dad',.5)}${pose(262,100,-31,'#77a8f5',.76)}${pose(400,173,-81,'#a4c7ff')}<g fill="none" stroke="#739fe3" stroke-width="1" opacity=".7"><path d="M70 63V50H89M155 50H174V63M70 191V204H89M155 204H174V191"/><path d="M333 140V129H345M495 129H506V140M333 199V211H345M495 211H506V199"/></g><path d="M183 112C205 108 221 113 237 132M300 150C315 159 325 168 337 173" stroke="#729ddd" fill="none" stroke-dasharray="3 4"/><g font-family="monospace" font-size="8" letter-spacing="1"><text x="101" y="231" fill="#7a92b1">NORMAL</text><text x="230" y="231" fill="#93b7ed">FALLING</text><text x="390" y="231" fill="#b7d2ff">FALLEN</text></g><rect x="358" y="100" width="110" height="19" rx="3" fill="#243c5c" stroke="#4f75a8"/><circle cx="369" cy="109" r="2" fill="#a5c7ff"/><text x="377" y="112" fill="#c1d6f6" font-size="7" font-family="monospace">ALERT PERSISTS</text>`, 'Illustration of a person moving from normal to falling to fallen');
}
function labVisual() {return `<div class="mini-window"><div class="mini-title"><span>⌁ &nbsp; HOME LAB / OVERVIEW</span><i>● SYSTEM ONLINE</i></div><div class="mini-metrics">${[['CPU','24.8','24.8%'],['MEMORY','42.1','42.1%'],['DISK','61.7','61.7%']].map(([name,value,width])=>`<div><small>${name}</small><strong>${value}<span>%</span></strong><div class="mini-bar" style="--pct:${width}"></div></div>`).join('')}</div><div class="mini-chart">${svgShell('<path d="M0 36L18 33L29 36L39 29L46 33L61 16L72 25L87 22L99 29L115 27L125 8L136 18L152 21L165 10L181 19L190 9L207 12L223 28L239 23L251 30L268 17L281 20L299 7L315 13L330 8" fill="none" stroke="#79aaff" stroke-width="1.5"/><path d="M0 45H330M0 22H330" stroke="#345074" stroke-width=".5" opacity=".5"/>','Illustrative CPU history','0 0 330 48')}</div><div class="mini-footer"><span>UPTIME &nbsp;12h 00m</span><span>GET /metrics &nbsp;↗</span></div></div>`}
function apiVisual(){return `<div class="mini-window api-window"><div class="mini-title"><span>{ } &nbsp; TASK MANAGER API</span><i>JWT AUTH</i></div>${[['POST','/auth/login','TOKEN'],['GET','/tasks','200 OK'],['POST','/tasks','201 CREATED'],['PATCH','/tasks/{task_id}','200 OK']].map(([m,p,s])=>`<div class="endpoint"><b>${m}</b><span>${p}</span><i>${s}</i></div>`).join('')}<div class="mini-footer"><span>POSTGRESQL · SQLALCHEMY</span><span>OWNER-SCOPED ↗</span></div></div>`}
function botVisual(){return `<div class="mini-window chat-window"><div class="mini-title"><span># &nbsp; MAPLESTORY / COMMUNITY</span><span>✦</span></div><div class="chat-line"><span class="chat-command">/events</span><span> &nbsp; What’s coming up?</span></div><div class="chat-response"><b>✦ &nbsp; Your next adventure</b><p>Event information, all in one place.<br>Game updates · Reset info · Player utilities</p></div><div class="chat-bottom">/help &nbsp; → &nbsp; discover commands</div></div>`}
const visualMap = {fall:fallVisual,lab:labVisual,api:apiVisual,bot:botVisual};
const visualKind = ['fall','lab','api','bot'];

function renderCards(){
  document.querySelector('#projects').innerHTML=projects.map((p,i)=>`<article class="project-card" data-category="${p.filter}"><div class="project-visual ${visualKind[i]}-visual" aria-hidden="true">${visualMap[visualKind[i]]()}<span class="visual-label">${['TEMPORAL VISION PIPELINE','SYSTEM HEALTH AT A GLANCE','AUTHENTICATED BY DESIGN','COMMUNITY, AUTOMATED'][i]}</span><span class="visual-note">${i===0?'System illustration':'Illustrative preview'}</span></div><div class="project-info"><div class="project-category"><span>0${i+1}</span> / ${p.category}</div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><div class="project-tags">${p.stack.map(s=>`<span class="tag">${escapeHTML(s)}</span>`).join('')}</div><div class="card-bottom"><span><strong>${escapeHTML(p.highlight)}</strong></span><button class="case-button" data-project="${p.id}" aria-label="Explore ${escapeHTML(p.title)}">Case study ${arrow}</button></div></div></article>`).join('');
}

function renderLattice(){
 const target=document.querySelector('#lattice');
 const project=(x,y,z)=>[280+(x-y)*31,246+(x+y)*15-z*37];
 let content='';
 for(let z=0;z<5;z++) {
  const corners=[[-3,-3], [3,-3], [3,3],[-3,3]].map(([x,y])=>project(x,y,z));
  content+=`<path d="M${corners.join('L')}Z" fill="url(#plane)" stroke="#588acc" stroke-width=".9" opacity="${.23+z*.09}"/>`;
  for(let k=-3;k<=3;k++){
    content+=`<path d="M${project(k,-3,z)}L${project(k,3,z)}M${project(-3,k,z)}L${project(3,k,z)}" stroke="#5083c7" stroke-width=".6" opacity="${.22+z*.07}"/>`;
  }
 }
 for(const [x,y] of [[-3,-3],[3,-3],[3,3],[-3,3],[0,0],[-1,1],[2,-1]])content+=`<path d="M${project(x,y,0)}L${project(x,y,4)}" stroke="#83b3fa" stroke-width=".6" stroke-dasharray="2 3" opacity=".6"/>`;
 for(const [x,y,z] of [[0,0,4],[-2,-1,4],[1,-2,3],[2,1,4],[-2,2,2],[0,0,0],[3,3,0],[1,1,2]]){
   const [cx,cy]=project(x,y,z);content+=`<circle cx="${cx}" cy="${cy}" r="7" fill="#6ba8ff" filter="url(#glow)" opacity=".45"/><circle cx="${cx}" cy="${cy}" r="2.4" fill="#b0d0ff"/>`;
 }
 content+=`<path d="M${project(-2,-1,4)}L${project(0,-1,4)}L${project(0,0,4)}L${project(0,0,0)}L${project(3,0,0)}L${project(3,3,0)}" fill="none" stroke="#9ec5ff" stroke-width="1.3" opacity=".9"/>`;
 target.innerHTML=content;
}

let activeProject=0,activeTab='overview',galleryIndex=0,triggerElement=null;
const dialog=document.querySelector('#project-dialog');
const panel=document.querySelector('#project-panel');
const tabButtons=[...document.querySelectorAll('[role=tab]')];

function updateProjectHeader(){
 const p=projects[activeProject];
 document.querySelector('#dialog-eyebrow').textContent=`0${activeProject+1} / ${p.category}`;
 document.querySelector('#dialog-heading').innerHTML=`<h2 id="dialog-title">${escapeHTML(p.title)}</h2><p>${escapeHTML(p.summary)}</p>`;
 document.querySelector('#repo-link').innerHTML=p.repo?`<a class="repo-button" href="${p.repo}" target="_blank" rel="noopener noreferrer">View repository ${arrow}</a>`:'<span class="repo-pending">Repository link pending<small>Add the project URL to complete this case study.</small></span>';
}
function selectTab(tab,focus=false){
 activeTab=tab;
 for(const button of tabButtons){const active=button.dataset.tab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();}
 panel.setAttribute('aria-labelledby',`tab-${tab}`);
 renderPanel();
}
function openProject(index,updateHash=true){
 activeProject=index;galleryIndex=0;
 if(!dialog.open){triggerElement=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');}
 updateProjectHeader();selectTab('overview');dialog.scrollTop=0;
 document.querySelector('#close-dialog').focus({preventScroll:true});
 if(updateHash)history.replaceState(null,'',`#project/${projects[index].id}`);
}
function closeProject(){
 if(dialog.open)dialog.close();
}
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(location.hash.startsWith('#project/'))history.replaceState(null,'','#work');triggerElement?.focus({preventScroll:true});});
document.querySelector('#close-dialog').addEventListener('click',closeProject);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeProject();}});
document.querySelector('#next-project').addEventListener('click',()=>openProject((activeProject+1)%projects.length));
document.querySelector('#projects').addEventListener('click',event=>{const b=event.target.closest('[data-project]');if(b)openProject(projects.findIndex(p=>p.id===b.dataset.project));});
for(const tab of tabButtons){tab.addEventListener('click',()=>selectTab(tab.dataset.tab));tab.addEventListener('keydown',e=>{const current=tabButtons.indexOf(tab);let next;if(e.key==='ArrowRight')next=(current+1)%tabButtons.length;if(e.key==='ArrowLeft')next=(current-1+tabButtons.length)%tabButtons.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabButtons.length-1;if(next!==undefined){e.preventDefault();selectTab(tabButtons[next].dataset.tab,true);}});}

function renderPanel(){
 const p=projects[activeProject];
 if(activeTab==='overview')panel.innerHTML=`<div class="case-columns"><div class="case-copy"><h3>The problem</h3><p>${escapeHTML(p.problem)}</p><h3>The approach</h3><p>${escapeHTML(p.approach)}</p></div><aside class="case-aside"><h3>PROJECT AT A GLANCE</h3><div class="project-tags">${p.fullStack.map(s=>`<span class="tag">${escapeHTML(s)}</span>`).join('')}</div><dl><dt>PROJECT TYPE</dt><dd>${escapeHTML(p.type)}</dd><dt>YEAR</dt><dd>${p.year}</dd><dt>KEY DECISION</dt><dd>${escapeHTML(p.decision)}</dd></dl></aside></div>`;
 if(activeTab==='implementation')panel.innerHTML=p.steps.map(([title,description],i)=>`<div class="implementation-step"><span>0${i+1}</span><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></div></div>`).join('')+`<div class="code-caption">${escapeHTML(p.codeLabel)}</div><pre class="code-block">${escapeHTML(p.code)}</pre><p class="case-note">${escapeHTML(p.sourceNote)}</p>`;
 if(activeTab==='results')panel.innerHTML=(p.metrics?`<div class="result-metrics">${p.metrics.map(([value,label])=>`<div class="result-metric"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>`:'')+`<ul class="results-list">${p.outcomes.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><p class="case-note">${escapeHTML(p.resultNote)}</p>`;
 if(activeTab==='gallery')renderGallery();
}

function diagramVisual(kind){
 const themes={pipeline:{top:'VISION → TEMPORAL REASONING',nodes:['Pose + tracking','5 motion features','LSTM classifier','Persistent alert'],bottom:'Normal / Falling / Fallen'},ownership:{top:'ONE AUTHENTICATED USER. THEIR OWN TASKS.',nodes:['Bearer token','Current user','Owner filter','Task response'],bottom:'Task.owner_id == current_user.id'},botflow:{top:'INFORMATION, WHERE PLAYERS ALREADY ARE',nodes:['Discord input','Command handler','Web / API data','Bot response'],bottom:'Commands · announcements · player utilities'}};
 const d=themes[kind];let nodes='';
 d.nodes.forEach((n,i)=>{const x=i%2===0?70:305,y=i<2?72:169;nodes+=`<rect x="${x}" y="${y}" width="165" height="46" rx="5" fill="#182a40" stroke="#36547b"/><text x="${x+13}" y="${y+18}" fill="#6d9adb" font-family="monospace" font-size="7">0${i+1}</text><text x="${x+13}" y="${y+34}" fill="#c4d8f5" font-family="sans-serif" font-size="11">${n}</text>`;});
 return svgShell(`<rect width="540" height="285" fill="#101925"/><g stroke="#26384f" opacity=".5">${Array.from({length:12},(_,i)=>`<path d="M${i*50} 0V285"/>`).join('')}</g><text x="32" y="34" font-family="monospace" font-size="8" letter-spacing="1" fill="#8ea9ce">${d.top}</text>${nodes}<path d="M235 95H300M387 118V144H152V163M235 192H300" stroke="#76a4e6" fill="none" stroke-dasharray="3 4"/><path d="M296 92L302 95L296 98M149 160L152 166L155 160M296 189L302 192L296 195" stroke="#76a4e6" fill="none"/><text x="270" y="257" text-anchor="middle" font-family="monospace" font-size="8" fill="#859cbb">${d.bottom}</text>`,'Project architecture: '+d.nodes.join(', '),'0 0 540 285');
}
function contractVisual(){return svgShell(`<rect width="540" height="300" fill="#0f1825"/><text x="34" y="36" fill="#80aceb" font-family="monospace" font-size="10">GET /metrics</text><text x="390" y="36" fill="#789a93" font-family="monospace" font-size="8">SAMPLE RESPONSE</text><path d="M34 51H506" stroke="#2e415e"/><g font-family="monospace" font-size="12" fill="#b9cee9">${projects[1].code.split('\n').slice(1).map((line,i)=>`<text x="40" y="${80+i*24}" xml:space="preserve">${escapeHTML(line)}</text>`).join('')}</g>`,'Illustrative JSON response with the actual API field names','0 0 540 300');}
function renderGallery(){
 const p=projects[activeProject], g=p.gallery[galleryIndex];
 let markup;
 if(g.image)markup=`<img src="${g.image}" alt="${escapeHTML(g.title)}" loading="eager">`;
 else if(g.kind==='fall')markup=fallVisual();
 else if(['pipeline','ownership','botflow'].includes(g.kind))markup=diagramVisual(g.kind);
 else if(g.kind==='contract')markup=contractVisual();
 else markup=`<div class="project-visual ${g.kind}-visual" style="height:300px" aria-label="${escapeHTML(g.title)}">${visualMap[g.kind]()}</div>`;
 panel.innerHTML=`<div class="gallery-frame">${markup}</div><div class="gallery-controls"><div class="gallery-caption" style="display:block"><h3>${escapeHTML(g.title)}</h3><p>${escapeHTML(g.caption)}</p></div><div><button id="gallery-prev" aria-label="Previous image">←</button><button id="gallery-next" aria-label="Next image">→</button></div></div><p class="gallery-counter" style="margin-top:14px" aria-live="polite">${galleryIndex+1} / ${p.gallery.length}</p>${p.gallery.some(x=>x.image)?'':`<div class="missing-screenshot"><strong>Original screenshots coming soon</strong><p>These illustrations explain the project. Captured application screenshots have not been supplied.</p></div>`}`;
 document.querySelector('#gallery-prev').addEventListener('click',()=>{galleryIndex=(galleryIndex-1+p.gallery.length)%p.gallery.length;renderGallery();document.querySelector('#gallery-prev').focus({preventScroll:true});});
 document.querySelector('#gallery-next').addEventListener('click',()=>{galleryIndex=(galleryIndex+1)%p.gallery.length;renderGallery();document.querySelector('#gallery-next').focus({preventScroll:true});});
}

for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{
 const filter=button.dataset.filter;let count=0;
 document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('.project-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)count++;});
 document.querySelector('#filter-status').textContent=`Showing ${count} project${count===1?'':'s'}.`;
});

let toastTimeout;
function showToast(message){const toast=document.querySelector('.toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3000);}
document.querySelector('#copy-email').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText('evann.ruizz@gmail.com');showToast('Email address copied');}
 catch{showToast('Select the email address to copy it.');const range=document.createRange();range.selectNodeContents(document.querySelector('.email-link'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
});

function handleProjectHash(){if(location.hash.startsWith('#project/')){const id=location.hash.slice(9);const index=projects.findIndex(p=>p.id===id);if(index!==-1)openProject(index,false);}else if(dialog.open)closeProject();}
window.addEventListener('hashchange',handleProjectHash);
renderCards();renderLattice();handleProjectHash();
