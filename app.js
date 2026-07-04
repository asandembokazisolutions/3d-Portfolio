/* ============================================================
   SCROLL PROGRESS
   ============================================================ */
(function(){
  const bar = document.getElementById('scrollProgress');
  function update(){
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

/* ============================================================
   NAV SCROLL SPY
   ============================================================ */
(function(){
  const sections = document.querySelectorAll('.section');
  const topLinks = document.querySelectorAll('.nav-link');
  const bottomLinks = document.querySelectorAll('.bn-link');
  function setActive(id){
    topLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    bottomLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) setActive(e.target.id); });
  }, {rootMargin:'-45% 0px -45% 0px', threshold:0});
  sections.forEach(s=>obs.observe(s));
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function(){
  const targets = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); o.unobserve(e.target); }
    });
  }, {threshold:0.1});
  targets.forEach(t=>obs.observe(t));
})();

/* ============================================================
   SKILL BARS
   ============================================================ */
(function(){
  const fills = document.querySelectorAll('.node-fill');
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        el.style.width = el.dataset.w + '%';
        o.unobserve(el);
      }
    });
  }, {threshold:0.3});
  fills.forEach(f=>obs.observe(f));
})();

/* ============================================================
   STACK ACCORDION (skills)
   ============================================================ */
(function(){
  document.querySelectorAll('.stack-head').forEach(head=>{
    head.addEventListener('click', ()=>{
      const layer = head.closest('.stack-layer');
      const wasOpen = layer.classList.contains('open');
      // allow multiple open; just toggle this one
      layer.classList.toggle('open', !wasOpen);
      if(!wasOpen){
        layer.querySelectorAll('.node-fill').forEach(f=>{ f.style.width = f.dataset.w + '%'; });
      }
    });
  });
})();

/* ============================================================
   PROJECT ROWS — expand/collapse + mini graph draw
   ============================================================ */
(function(){
  document.querySelectorAll('.proj-summary').forEach(summary=>{
    summary.addEventListener('click', ()=>{
      const row = summary.closest('.proj-row');
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.proj-row.open').forEach(r=>{ if(r!==row) r.classList.remove('open'); });
      row.classList.toggle('open', !isOpen);
      if(!isOpen){
        const canvas = row.querySelector('.miniGraph');
        if(canvas && !canvas.dataset.drawn){
          requestAnimationFrame(()=> drawMiniGraph(canvas));
          canvas.dataset.drawn = '1';
        }
      }
    });
  });
})();

function drawMiniGraph(canvas){
  const type = canvas.dataset.type;
  const wrap = canvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr,dpr);

  const accent = '#5b9dd9';
  const line = '#1b212c';
  const warn = '#d9a656';
  const faint = '#414c5e';

  function drawNode(x,y,r,color){
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = '#04060a';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  function drawEdge(x1,y1,x2,y2,color){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if(type === 'linear'){
    const n = 4;
    const pts = [];
    for(let i=0;i<n;i++) pts.push([w*0.12 + i*(w*0.76/(n-1)), h/2]);
    for(let i=0;i<n-1;i++) drawEdge(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], line);
    pts.forEach((p,i)=> drawNode(p[0],p[1], i===0||i===n-1?5:4, i===n-1?accent:faint));
    drawNode(pts[n-1][0],pts[n-1][1],5,accent);
  }
  else if(type === 'mesh'){
    const pts = [
      [w*0.5,h*0.22],[w*0.22,h*0.5],[w*0.5,h*0.5],[w*0.78,h*0.5],[w*0.5,h*0.78]
    ];
    const edges = [[0,2],[1,2],[2,3],[2,4],[1,4],[3,4]];
    edges.forEach(([a,b])=>drawEdge(pts[a][0],pts[a][1],pts[b][0],pts[b][1], line));
    pts.forEach((p,i)=> drawNode(p[0],p[1], i===2?6:4, i===2?accent:faint));
  }
  else if(type === 'layered'){
    const layers = [h*0.2, h*0.5, h*0.8];
    const labels = 3;
    layers.forEach((y,li)=>{
      for(let i=0;i<labels;i++){
        const x = w*0.2 + i*(w*0.6/(labels-1));
        if(li < layers.length-1){
          const nextY = layers[li+1];
          drawEdge(x, y, w*0.2 + i*(w*0.6/(labels-1)), nextY, line);
        }
      }
    });
    layers.forEach((y,li)=>{
      for(let i=0;i<labels;i++){
        const x = w*0.2 + i*(w*0.6/(labels-1));
        drawNode(x,y,4, li===1?accent:faint);
      }
    });
  }
  else if(type === 'restricted'){
    ctx.strokeStyle = faint;
    ctx.setLineDash([4,4]);
    ctx.strokeRect(w*0.3,h*0.3,w*0.4,h*0.4);
    ctx.setLineDash([]);
    ctx.fillStyle = warn;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKED', w/2, h/2+3);
  }
}

/* ============================================================
   CONTACT FORM — hands off to the visitor's own email client
   ============================================================ */
const CONTACT_EMAIL = 'Asandeseaphesihle@gmail.com';

function handleContactSubmit(e){
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type="text"]').value.trim();
  const email = form.querySelector('input[type="email"]').value.trim();
  const message = form.querySelector('textarea').value.trim();

  const subject = `Portfolio Contact — ${name}`;
  const body =
`Name: ${name}
Email: ${email}

${message}`;

  const mailtoUrl =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const btn = form.querySelector('.form-submit');
  const original = btn.textContent;
  btn.textContent = 'Opening email client…';
  btn.style.opacity = '.7';

  window.location.href = mailtoUrl;

  setTimeout(()=>{
    btn.textContent = original;
    btn.style.opacity = '1';
  }, 2200);

  return false;
}

/* ============================================================
   HERO — 3D SYSTEM ARCHITECTURE VISUALIZATION (Three.js)
   ============================================================ */
(function(){
  const canvas = document.getElementById('heroCanvas');
  if(!canvas || typeof THREE === 'undefined') return;

  let scene, camera, renderer, group;
  let nodes = [], edges = [];
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  let width, height;

  function init(){
    scene = new THREE.Scene();
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;

    camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100);
    camera.position.set(0, 0, 16);

    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    group = new THREE.Group();
    scene.add(group);

    buildArchitecture();
    window.addEventListener('resize', onResize);
    canvas.parentElement.addEventListener('mousemove', onMouseMove);
    canvas.classList.add('ready');
    animate();
  }

  function buildArchitecture(){
    // layered node-graph: 3 layers x N nodes, like a system architecture diagram
    const layerCounts = [4, 6, 3];
    const layerZ = [-3, 0, 3];
    const layerColor = [0x5b9dd9, 0x3d7ab0, 0x2c5a85];
    const layerPositions = [];

    const nodeGeo = new THREE.IcosahedronGeometry(0.11, 0);
    const edgeMat = new THREE.LineBasicMaterial({color:0x1b212c, transparent:true, opacity:0.5});

    layerCounts.forEach((count, li)=>{
      const positions = [];
      const radius = 4.2 - li*0.3;
      for(let i=0;i<count;i++){
        const angle = (i/count) * Math.PI*2 + li*0.6;
        const x = Math.cos(angle) * radius * (0.5 + Math.random()*0.5);
        const y = Math.sin(angle) * radius * 0.5 * (0.5 + Math.random()*0.5);
        const z = layerZ[li] + (Math.random()-0.5)*0.8;
        const mat = new THREE.MeshBasicMaterial({color: layerColor[li], transparent:true, opacity:0.85, wireframe:true});
        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.set(x,y,z);
        group.add(mesh);
        positions.push(mesh);

        // soft glow point
        const glowGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({color: layerColor[li]});
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(mesh.position);
        group.add(glow);
      }
      layerPositions.push(positions);
      nodes.push(...positions);
    });

    // connect adjacent layers (architecture-diagram style, sparse and deliberate)
    for(let li=0; li<layerPositions.length-1; li++){
      const from = layerPositions[li];
      const to = layerPositions[li+1];
      from.forEach((fNode)=>{
        // connect to 1-2 nodes in next layer
        const connections = 1 + Math.floor(Math.random()*2);
        for(let c=0;c<connections;c++){
          const tNode = to[Math.floor(Math.random()*to.length)];
          const points = [fNode.position, tNode.position];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geo, edgeMat);
          group.add(line);
          edges.push({line, from:fNode, to:tNode, geo});
        }
      });
    }

    // data pulse particles traveling along a few edges (quiet, not decorative excess)
    setupPulses();
  }

  let pulses = [];
  function setupPulses(){
    const pulseGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const pulseMat = new THREE.MeshBasicMaterial({color:0x4ade80});
    const sampleEdges = edges.filter((_,i)=> i % 4 === 0).slice(0, 6);
    sampleEdges.forEach(edge=>{
      const mesh = new THREE.Mesh(pulseGeo, pulseMat.clone());
      group.add(mesh);
      pulses.push({mesh, edge, t: Math.random(), speed: 0.15 + Math.random()*0.15});
    });
  }

  function onResize(){
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function onMouseMove(e){
    const rect = canvas.parentElement.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
    mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
    targetRotY = mouseX * 0.35;
    targetRotX = mouseY * 0.2;
  }

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    // slow ambient rotation + subtle parallax toward pointer
    group.rotation.y += (targetRotY - group.rotation.y + t*0.02) * 0.02;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
    group.rotation.y = group.rotation.y * 0.999 + t*0.015*0.001;

    // gentle breathing rotation baseline
    group.rotation.y += 0.0009;

    pulses.forEach(p=>{
      p.t += dt * p.speed;
      if(p.t > 1) p.t = 0;
      p.mesh.position.lerpVectors(p.edge.from.position, p.edge.to.position, p.t);
      const s = 1 + Math.sin(p.t * Math.PI) * 0.5;
      p.mesh.scale.setScalar(s);
    });

    renderer.render(scene, camera);
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
