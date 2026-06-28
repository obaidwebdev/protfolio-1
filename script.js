(function createSpaceLoader() {
  // 1. Full screen container
  const loader = document.createElement('div');
  loader.id = 'obaid-space-loader';
  Object.assign(loader.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    backgroundColor: '#02030A', zIndex: '9999', transition: 'opacity 2s ease',
    overflow: 'hidden'
  });
  document.body.appendChild(loader);

  // 2. Load Three.js
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => { initSpacePhysics(loader); };
  document.head.appendChild(script);

  // 3. Physics Simulation (Minimalist)
  function initSpacePhysics(container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Geometry: Random 3D cloud
    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 40;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material: Brand Blue Particles
    const material = new THREE.PointsMaterial({ size: 0.05, color: 0x9400fd, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 15;

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // 4. Smooth Exit
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 2000);
    }, 2000);
  });
})();

(function initInteractiveSpace() {
  // 1. Setup Canvas for background
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0', zIndex: '-1',
    pointerEvents: 'none' // Taake click karte waqt canvas beech mein na aaye
  });
  document.body.appendChild(canvas);
  document.body.style.backgroundColor = '#02030A';

  // 2. Load Three.js
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const count = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 50;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ size: 0.08, color: 0x9400fd });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 20;

    // 3. Mouse Interaction Logic
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // 4. Animation with Mouse Physics
    function animate() {
      requestAnimationFrame(animate);
      // Particles slowly follow mouse movement
      particles.rotation.y += (mouseX * 0.05 - particles.rotation.y) * 0.05;
      particles.rotation.x += (-mouseY * 0.05 - particles.rotation.x) * 0.05;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };
  document.head.appendChild(script);
})();

(() => {
  const old = document.getElementById("obaid-cursor-magic");
  if (old) old.remove();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.id = "obaid-cursor-magic";

  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "999999",
    mixBlendMode: "screen"
  });

  document.body.appendChild(canvas);

  let dpr = 1;
  const particles = [];
  const sparks = [];
  const trail = [];
  const MAX_PARTICLES = 220;
  const MAX_TRAIL = 28;

  const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2,
    px: innerWidth / 2,
    py: innerHeight / 2,
    speed: 0,
    active: false
  };

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  addEventListener("resize", resize);

  function addParticles(x, y, amount) {
    amount = Math.min(amount, 6);

    while (particles.length > MAX_PARTICLES) particles.shift();

    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 2.5 + Math.min(mouse.speed, 40) * 0.02;

      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        size: Math.random() * 2.5 + 1,
        life: 1,
        decay: Math.random() * 0.025 + 0.018
      });
    }
  }

  function move(x, y) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;

    const dx = mouse.x - mouse.px;
    const dy = mouse.y - mouse.py;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);

    trail.push({ x, y, life: 1 });
    while (trail.length > MAX_TRAIL) trail.shift();

    addParticles(x, y, 3 + mouse.speed / 14);

    if (mouse.speed > 35 && sparks.length < 5) {
      sparks.push({ x, y, r: 6, life: 1 });
    }
  }

  addEventListener("mousemove", e => move(e.clientX, e.clientY), { passive: true });

  addEventListener("touchmove", e => {
    const t = e.touches[0];
    if (t) move(t.clientX, t.clientY);
  }, { passive: true });

  addEventListener("click", e => {
    addParticles(e.clientX, e.clientY, 45);
    if (sparks.length < 8) sparks.push({ x: e.clientX, y: e.clientY, r: 8, life: 1 });
  });

  function drawTrail() {
    if (trail.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length; i++) {
      const p = trail[i];
      const prev = trail[i - 1];
      const mx = (prev.x + p.x) / 2;
      const my = (prev.y + p.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }

    const first = trail[0];
    const last = trail[trail.length - 1];
    const g = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    g.addColorStop(0, "rgba(148,0,253,0)");
    g.addColorStop(1, "rgba(255,255,255,.85)");

    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#9400fd";
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.045;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(148,0,253,${p.life})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#9400fd";
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];

      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.strokeStyle = `rgba(148,0,253,${s.life})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#9400fd";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      s.r += 4;
      s.life -= 0.06;
    }
  }

  function drawCursor() {
    if (!mouse.active) return;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#9400fd";
    ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function animate() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    drawTrail();
    drawParticles();
    drawSparks();
    drawCursor();
    requestAnimationFrame(animate);
  }

  animate();
})();

document.querySelectorAll("img").forEach((img) => {

  img.addEventListener("mousemove", (e) => {

    const rect = img.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

  });

  img.addEventListener("mouseleave", () => {
    img.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  });

});



async function loadWebsites() {
  try {
    const res = await fetch("https://obaidwebdev.github.io/sites.json");
    const data = await res.json();

    const container = document.querySelector(".website-list");

    data.websites.forEach(site => {

      // Current website ko skip karo
      if (site.url.replace(/\/$/, "") === location.origin.replace(/\/$/, "")) return;

      const card = document.createElement("a");
      card.href = site.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      card.className = "website-card";

      card.innerHTML = `
                <img src="${site.favicon || site.url + '/favicon.ico'}"
                     alt="${site.title}"
                     loading="lazy"
                     onerror="this.src='favicon.ico'">

                <span>${site.title}</span>
            `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Site list failed:", err);
  }
}

loadWebsites();
