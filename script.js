/* ============================================================
   FOR MY LOVE ❤️ - MAGICAL INTERACTIVE & ANIMATION ENGINE
   WITH AUTOMATIC ROMANTIC BGM PLAYBACK
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initRomanticBgm();
    initAmbientCanvas();
    initCursorSparkles();
    initScrollReveal();
    initPhotoFrame();
    initBirthdayCake();
    initRunawayNoButton();
    initProposalRingBox();
    initPromiseSeal();
    initAudioCards();
    initLoginPage();

    // Birthday page celebratory confetti burst on load
    if (document.body.classList.contains("birthday-page") ||
        window.location.pathname.includes("birthday.html")) {
        setTimeout(() => {
            playChimeSound();
            triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.35, 75);
        }, 500);
    }
});

/* ============================================================
   1. ROMANTIC BACKGROUND MUSIC (BGM) - AUTO-PLAY SYSTEM
============================================================ */

let bgmAudio = null;
let bgmStarted = false;
let userManuallyPaused = false;
let soundPillBtn = null;

function initRomanticBgm() {
    userManuallyPaused = sessionStorage.getItem("bgm_manual_pause") === "true";

    // 1. Create or bind persistent BGM element
    bgmAudio = document.getElementById("romanticBgmAudio");
    if (!bgmAudio) {
        bgmAudio = document.createElement("audio");
        bgmAudio.id = "romanticBgmAudio";
        bgmAudio.loop = true;
        bgmAudio.preload = "auto";
        bgmAudio.volume = 0.55; // Sweet, gentle romantic volume

        // Looks for user's MP3 first, then default generated romantic BGM
        bgmAudio.innerHTML = `
            <source src="assets/song.mp3" type="audio/mpeg">
        `;
        document.body.appendChild(bgmAudio);
    }

    // Restore saved playback position for seamless page transitions
    const savedTime = sessionStorage.getItem("bgm_time");
    if (savedTime && !isNaN(savedTime)) {
        bgmAudio.currentTime = parseFloat(savedTime);
    }

    // Save playback position periodically
    setInterval(() => {
        if (bgmAudio && !bgmAudio.paused && bgmAudio.currentTime > 0) {
            sessionStorage.setItem("bgm_time", bgmAudio.currentTime);
        }
    }, 1000);

    // 2. Create Floating Romantic Music Pill Button
    createSoundPill();

    // 3. Audio state listeners
    bgmAudio.addEventListener("play", () => {
        bgmStarted = true;
        updateSoundPillUI(true);
    });

    bgmAudio.addEventListener("pause", () => {
        updateSoundPillUI(false);
    });

    // 4. Trigger Automatic Playback
    if (!userManuallyPaused) {
        attemptAutoplay();
    } else {
        updateSoundPillUI(false);
    }
}

function createSoundPill() {
    if (document.querySelector(".sound-toggle-pill")) {
        soundPillBtn = document.querySelector(".sound-toggle-pill");
        return;
    }

    soundPillBtn = document.createElement("button");
    soundPillBtn.className = "sound-toggle-pill waiting-gesture";
    soundPillBtn.title = "Click to Play / Pause Romantic Music";
    soundPillBtn.innerHTML = `
        <span class="sound-label">🎵 Romantic Music</span>
        <div class="sound-wave-icon">
            <span></span><span></span><span></span>
        </div>
    `;

    soundPillBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleRomanticBgm();
    });

    document.body.appendChild(soundPillBtn);
}

function updateSoundPillUI(isPlaying) {
    if (!soundPillBtn) soundPillBtn = document.querySelector(".sound-toggle-pill");
    if (!soundPillBtn) return;

    soundPillBtn.classList.remove("waiting-gesture");

    if (isPlaying) {
        soundPillBtn.classList.add("playing");
        soundPillBtn.querySelector(".sound-label").textContent = "🎵 Playing Music ❤️";
    } else {
        soundPillBtn.classList.remove("playing");
        soundPillBtn.querySelector(".sound-label").textContent = "⏸️ Music Paused";
    }
}

function attemptAutoplay() {
    if (!bgmAudio) return;

    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                bgmStarted = true;
                updateSoundPillUI(true);
            })
            .catch(() => {
                // Modern browsers enforce a user gesture before unmuted audio plays
                setupFirstInteractionPlay();
            });
    }
}

function setupFirstInteractionPlay() {
    if (soundPillBtn) {
        soundPillBtn.classList.add("waiting-gesture");
        soundPillBtn.querySelector(".sound-label").textContent = "🎵 Tap to Play Music 💖";
    }

    function onFirstUserGesture() {
        if (!userManuallyPaused && bgmAudio && bgmAudio.paused) {
            bgmAudio.play().then(() => {
                bgmStarted = true;
                updateSoundPillUI(true);
            }).catch(() => {});
        }

        window.removeEventListener("pointerdown", onFirstUserGesture);
        window.removeEventListener("click", onFirstUserGesture);
        window.removeEventListener("touchstart", onFirstUserGesture);
        window.removeEventListener("keydown", onFirstUserGesture);
    }

    window.addEventListener("pointerdown", onFirstUserGesture, { once: true });
    window.addEventListener("click", onFirstUserGesture, { once: true });
    window.addEventListener("touchstart", onFirstUserGesture, { once: true });
    window.addEventListener("keydown", onFirstUserGesture, { once: true });
}

function toggleRomanticBgm() {
    if (!bgmAudio) return;

    if (bgmAudio.paused) {
        userManuallyPaused = false;
        sessionStorage.setItem("bgm_manual_pause", "false");
        bgmAudio.play().then(() => {
            updateSoundPillUI(true);
            playPopSound();
        }).catch(() => {});
    } else {
        userManuallyPaused = true;
        sessionStorage.setItem("bgm_manual_pause", "true");
        bgmAudio.pause();
        updateSoundPillUI(false);
    }
}

/* ============================================================
   2. SOUND EFFECTS (WEB AUDIO API)
============================================================ */

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playPopSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
}

function playChimeSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.value = freq;

            const startTime = ctx.currentTime + index * 0.09;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    } catch (e) {}
}

function playCandleBlowSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    } catch (e) {}
}

/* ============================================================
   3. AMBIENT CANVAS (HEARTS, STARS & ROSE PETALS)
============================================================ */

function initAmbientCanvas() {
    let canvas = document.getElementById("ambientCanvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "ambientCanvas";
        canvas.className = "ambient-canvas";
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", function () {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const isProposal = document.body.classList.contains("proposal-page") ||
                       window.location.pathname.includes("proposal.html");

    const particles = [];
    const particleCount = isProposal ? 40 : 28;

    for (let i = 0; i < particleCount; i++) {
        particles.push(createAmbientParticle(width, height, isProposal, true));
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y -= p.speedY;
            p.x += Math.sin(p.angle) * p.speedX;
            p.angle += p.angleSpeed;
            p.rotation += p.rotSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;

            if (p.type === "heart") {
                drawHeart(ctx, 0, 0, p.size, p.color);
            } else if (p.type === "petal") {
                drawPetal(ctx, 0, 0, p.size, p.color);
            } else if (p.type === "star") {
                drawStar(ctx, 0, 0, 4, p.size, p.size / 2, p.color);
            } else {
                drawCircle(ctx, 0, 0, p.size, p.color);
            }

            ctx.restore();

            if (p.y < -50 || p.x < -50 || p.x > width + 50) {
                particles[i] = createAmbientParticle(width, height, isProposal, false);
            }
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function createAmbientParticle(w, h, isProposal, randomInitialY = false) {
    const types = isProposal ? ["petal", "heart", "star"] : ["heart", "star", "circle"];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ["#f8b4c9", "#e98cae", "#ffd1e0", "#ffc2d4", "#f7a8b8"];

    return {
        x: Math.random() * w,
        y: randomInitialY ? Math.random() * h : h + 30 + Math.random() * 40,
        size: type === "heart" ? 10 + Math.random() * 14 : (type === "petal" ? 12 + Math.random() * 12 : 6 + Math.random() * 8),
        speedY: 0.5 + Math.random() * 1.0,
        speedX: 0.5 + Math.random() * 0.7,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        alpha: 0.25 + Math.random() * 0.45,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type
    };
}

function drawHeart(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
}

function drawPetal(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 1.1, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    ctx.fillStyle = color;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawCircle(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

/* ============================================================
   4. CURSOR / TOUCH SPARKLE TRAIL
============================================================ */

function initCursorSparkles() {
    let lastTime = 0;
    const sparkleColors = ["#e98cae", "#ffd166", "#f78fb3", "#ffc3a0", "#ffffff"];

    function spawnSparkle(x, y) {
        const now = Date.now();
        if (now - lastTime < 45) return;
        lastTime = now;

        const sparkle = document.createElement("div");
        sparkle.className = "cursor-sparkle";
        const size = 6 + Math.random() * 8;
        const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];

        sparkle.style.width = size + "px";
        sparkle.style.height = size + "px";
        sparkle.style.left = x + "px";
        sparkle.style.top = y + "px";
        sparkle.style.background = color;
        sparkle.style.boxShadow = `0 0 ${size * 1.5}px ${color}`;

        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 750);
    }

    window.addEventListener("pointermove", (e) => {
        spawnSparkle(e.clientX, e.clientY);
    }, { passive: true });
}

/* ============================================================
   5. SCROLL REVEAL OBSERVER
============================================================ */

function initScrollReveal() {
    const cards = document.querySelectorAll(
        ".photo-card, .message-card, .love-card, .music-card, .quote-card, .proposal-card, .verse-card, .cake-card, .surprise-section, .promise-section"
    );

    if (!("IntersectionObserver" in window)) {
        cards.forEach(card => card.classList.add("is-revealed"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => {
        card.classList.add("reveal-on-scroll");
        observer.observe(card);
    });
}

/* ============================================================
   6. PHOTO FRAME 3D TILT & GRACEFUL FALLBACK
============================================================ */

function initPhotoFrame() {
    const frame = document.querySelector(".photo-frame");
    if (!frame) return;

    const img = frame.querySelector("img");
    if (img) {
        img.addEventListener("error", function () {
            showPhotoFallback(frame);
        });

        setTimeout(() => {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                showPhotoFallback(frame);
            }
        }, 150);
    }

    // 3D Perspective Tilt on Mouse Movement
    frame.addEventListener("mousemove", (e) => {
        const rect = frame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    frame.addEventListener("mouseleave", () => {
        frame.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
}

function showPhotoFallback(frame) {
    if (!frame || frame.querySelector(".photo-fallback")) return;
    const existingImg = frame.querySelector("img");
    if (existingImg) existingImg.style.display = "none";

    const fallback = document.createElement("div");
    fallback.className = "photo-fallback";
    fallback.innerHTML = `
        <div class="photo-fallback-icon">📷❤️</div>
        <div class="photo-fallback-title">My Handsome King</div>
        <div class="photo-fallback-hint">Add your favorite photo to<br><b>assets/nelson.jpg</b></div>
    `;
    frame.appendChild(fallback);
}

/* ============================================================
   7. INTERACTIVE BIRTHDAY CAKE & CANDLE
============================================================ */

function initBirthdayCake() {
    let cake = document.getElementById("birthdayCake");
    let flame = document.getElementById("cakeFlame");
    let badge = document.getElementById("wishBadge");
    let btn = document.getElementById("blowCandleBtn");

    if (!cake) {
        const hero = document.querySelector(".hero-section");
        const photoCard = document.querySelector(".photo-card");

        if (hero && photoCard && !document.querySelector(".cake-card")) {
            const cakeCard = document.createElement("section");
            cakeCard.className = "cake-card cake-section reveal-on-scroll";
            cakeCard.innerHTML = `
                <div class="card-icon">🎂</div>
                <h2>Make A Birthday Wish, My Dear! 🕯️</h2>
                <p>Close your eyes, make a secret wish in your heart, and tap the candle to blow it out!</p>
                
                <div class="cake-display-container">
                    <div class="interactive-cake" id="birthdayCake" title="Click to blow out the candle!">
                        <div class="cake-candle">
                            <div class="cake-flame" id="cakeFlame"></div>
                            <div class="cake-smoke"></div>
                        </div>
                        <div class="cake-tier-top">
                            <div class="cake-frosting"></div>
                        </div>
                        <div class="cake-tier-bottom">
                            <div class="cake-frosting"></div>
                        </div>
                        <div class="cake-plate"></div>
                    </div>

                    <div class="wish-badge" id="wishBadge">
                        ✨ Your wish has been lifted up to Heaven! God bless you abundantly, my love! 🙏❤️
                    </div>
                </div>

                <button class="pink-button" id="blowCandleBtn" style="margin-top: 15px;">
                    Blow Out The Candle 💨
                </button>
            `;

            hero.parentNode.insertBefore(cakeCard, photoCard);

            cake = document.getElementById("birthdayCake");
            flame = document.getElementById("cakeFlame");
            badge = document.getElementById("wishBadge");
            btn = document.getElementById("blowCandleBtn");
        }
    }

    if (!cake || !flame) return;

    let isExtinguished = false;

    function toggleCandle() {
        if (!isExtinguished) {
            isExtinguished = true;
            flame.classList.add("extinguished");
            if (badge) badge.classList.add("show");
            if (btn) btn.textContent = "Relight Candle 🕯️";

            playCandleBlowSound();
            setTimeout(playChimeSound, 400);
            triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.45, 75);
        } else {
            isExtinguished = false;
            flame.classList.remove("extinguished");
            if (badge) badge.classList.remove("show");
            if (btn) btn.textContent = "Blow Out The Candle 💨";
            playPopSound();
        }
    }

    cake.addEventListener("click", toggleCandle);
    if (btn) btn.addEventListener("click", toggleCandle);
}

/* ============================================================
   8. RUNAWAY "NO" BUTTON & DOLL FALLBACK (SURPRISE PAGE)
============================================================ */

function initRunawayNoButton() {
    const noButton = document.getElementById("noButton");
    const yesButton = document.querySelector(".yes-button");
    const dollContainer = document.querySelector(".doll-container");

    if (dollContainer) {
        const dollImg = dollContainer.querySelector("img");
        if (dollImg) {
            dollImg.addEventListener("error", () => showDollFallback(dollContainer));
            setTimeout(() => {
                if (dollImg.naturalWidth === 0 || dollImg.naturalHeight === 0) {
                    showDollFallback(dollContainer);
                }
            }, 150);
        }
    }

    if (!noButton) return;

    let escapeCount = 0;
    let bubbleEl = null;

    const funnyPhrases = [
        "Nope! You can't click NO! 😜",
        "Are you sure, Baby? Look at me! 🥺",
        "Wrong answer! The pink button is so pretty! 💖",
        "Too slow, bby! 🏃💨",
        "Error 404: 'NO' is permanently disabled! 😉",
        "Destiny won't let you click this! 💍",
        "My heart already chose you! ❤️",
        "I'm fast like lightning! ⚡",
        "Chellam, please! Say YES! 🥹"
    ];

    const yesButtonPhrases = [
        "YES ❤️",
        "YES ❤️ (Baby please!)",
        "YES ❤️ (It's meant to be!)",
        "YES ❤️ (Forever & Always!)",
        "YES ❤️ (Click me already!)"
    ];

    function dodgeNoButton() {
        escapeCount++;
        playPopSound();

        const btnWidth = noButton.offsetWidth || 100;
        const btnHeight = noButton.offsetHeight || 50;
        const padding = 20;

        const maxX = window.innerWidth - btnWidth - padding;
        const maxY = window.innerHeight - btnHeight - padding;

        const newX = Math.max(padding, Math.random() * maxX);
        const newY = Math.max(padding, Math.random() * maxY);

        noButton.style.position = "fixed";
        noButton.style.left = newX + "px";
        noButton.style.top = newY + "px";
        noButton.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg) scale(0.92)`;

        showRunawayBubble(newX, newY, funnyPhrases[escapeCount % funnyPhrases.length]);

        if (yesButton) {
            const scale = Math.min(1.4, 1 + escapeCount * 0.08);
            yesButton.style.transform = `scale(${scale})`;
            const phraseIdx = Math.min(yesButtonPhrases.length - 1, escapeCount);
            yesButton.textContent = yesButtonPhrases[phraseIdx];
        }
    }

    function showRunawayBubble(x, y, text) {
        if (!bubbleEl) {
            bubbleEl = document.createElement("div");
            bubbleEl.className = "runaway-bubble";
            document.body.appendChild(bubbleEl);
        }

        bubbleEl.textContent = text;
        const bubbleX = Math.min(window.innerWidth - 220, Math.max(10, x - 20));
        const bubbleY = Math.max(15, y - 48);

        bubbleEl.style.left = bubbleX + "px";
        bubbleEl.style.top = bubbleY + "px";
        bubbleEl.style.display = "block";
    }

    noButton.addEventListener("mouseenter", dodgeNoButton);
    noButton.addEventListener("touchstart", function (e) {
        e.preventDefault();
        dodgeNoButton();
    });
    noButton.addEventListener("click", function (e) {
        e.preventDefault();
        dodgeNoButton();
    });
}

function showDollFallback(container) {
    if (!container || container.querySelector(".doll-fallback-svg")) return;
    const img = container.querySelector("img");
    if (img) img.style.display = "none";

    container.innerHTML = `
        <svg class="doll-fallback-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 60 C15 90 20 110 32 110 C36 100 38 80 40 70 Z" fill="#4a2e2b"/>
            <path d="M95 60 C105 90 100 110 88 110 C84 100 82 80 80 70 Z" fill="#4a2e2b"/>
            <circle cx="60" cy="50" r="32" fill="#ffe2d1"/>
            <path d="M28 50 C28 26 92 26 92 50 C88 42 78 38 60 38 C42 38 32 42 28 50 Z" fill="#4a2e2b"/>
            <path d="M30 45 C45 35 55 46 60 42 C65 46 75 35 90 45 C85 30 75 24 60 24 C45 24 35 30 30 45 Z" fill="#3b2422"/>
            <circle cx="28" cy="38" r="7" fill="#e98cae"/>
            <circle cx="92" cy="38" r="7" fill="#e98cae"/>
            <circle cx="48" cy="52" r="4.5" fill="#2d1c1a"/>
            <circle cx="72" cy="52" r="4.5" fill="#2d1c1a"/>
            <circle cx="46.5" cy="50.5" r="1.5" fill="#ffffff"/>
            <circle cx="70.5" cy="50.5" r="1.5" fill="#ffffff"/>
            <ellipse cx="43" cy="59" rx="5" ry="3" fill="#ff99bb" opacity="0.6"/>
            <ellipse cx="77" cy="59" rx="5" ry="3" fill="#ff99bb" opacity="0.6"/>
            <path d="M55 58 Q60 63 65 58" stroke="#d76591" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M46 80 L74 80 L82 108 L38 108 Z" fill="#f48fb1"/>
            <path d="M48 80 Q60 88 72 80" fill="#ffffff"/>
            <path d="M60 88 C60 82 52 82 52 88 C52 94 60 99 60 102 C60 99 68 94 68 88 C68 82 60 82 60 88 Z" fill="#e91e63"/>
        </svg>
    `;
}

/* ============================================================
   9. PROPOSAL PAGE: INTERACTIVE VELVET RING BOX
============================================================ */

function initProposalRingBox() {
    let ringBox = document.getElementById("proposalRingBox");

    if (!ringBox) {
        const ringEl = document.querySelector(".ring");
        if (ringEl) {
            const wrapper = document.createElement("div");
            wrapper.className = "ring-box-wrapper";
            wrapper.innerHTML = `
                <div class="ring-box open" id="proposalRingBox" title="Tap to open or close the ring box!">
                    <div class="ring-box-lid">
                        <div class="ring-box-clasp"></div>
                    </div>
                    <div class="sparkling-ring">💍</div>
                    <div class="ring-box-base">
                        <div class="ring-cushion"></div>
                    </div>
                </div>
                <div class="ring-click-hint">✨ Baby, Tap the Ring Box ✨</div>
            `;
            ringEl.parentNode.replaceChild(wrapper, ringEl);
            ringBox = document.getElementById("proposalRingBox");
        }
    }

    if (!ringBox) return;

    ringBox.addEventListener("click", () => {
        const isOpen = ringBox.classList.toggle("open");
        if (isOpen) {
            playChimeSound();
            triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.35, 60);
        } else {
            playPopSound();
        }
    });

    setTimeout(() => {
        playChimeSound();
        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.35, 80);
    }, 600);
}

/* ============================================================
   10. PROPOSAL PAGE: SEAL OUR LOVE PROMISE BUTTON
============================================================ */

function initPromiseSeal() {
    let sealBtn = document.getElementById("sealLoveBtn");
    let certificate = document.getElementById("sealCertificate");

    if (!sealBtn) {
        const proposalContainer = document.querySelector(".proposal-container");
        const footer = document.querySelector(".love-footer");

        if (proposalContainer && footer && !document.querySelector(".promise-section")) {
            const promiseSection = document.createElement("section");
            promiseSection.className = "promise-section reveal-on-scroll";
            promiseSection.innerHTML = `
                <button class="seal-button" id="sealLoveBtn">
                    🔒 Lock Our Promise Forever ❤️
                </button>
                <div class="seal-certificate" id="sealCertificate">
                    <h3>📜 An Eternal Covenant with My Love</h3>
                    <p>
                        "I have loved you with an everlasting love; I have drawn you with unfailing kindness." — Jeremiah 31:3
                    </p>
                    <p style="margin-top: 10px; font-weight: 700; color: #8b6508;">
                        Locked in Heaven & Bound with Endless Love.<br>
                        My Hubby & His Forever Girl ♾️💍❤️
                    </p>
                </div>
            `;

            proposalContainer.insertBefore(promiseSection, footer);
            sealBtn = document.getElementById("sealLoveBtn");
            certificate = document.getElementById("sealCertificate");
        }
    }

    if (!sealBtn || !certificate) return;

    sealBtn.addEventListener("click", () => {
        certificate.classList.add("active");
        sealBtn.style.display = "none";
        playChimeSound();
        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
    });
}

/* ============================================================
   11. MUSIC CARDS & AUDIO VISUALIZER
============================================================ */

function initAudioCards() {
    const musicCards = document.querySelectorAll(".music-card");

    musicCards.forEach(card => {
        const audio = card.querySelector("audio");

        if (audio) {
            // When user plays dedicated song on the page, duck/pause background BGM
            audio.addEventListener("play", () => {
                card.classList.add("playing");
                if (bgmAudio && !bgmAudio.paused) {
                    bgmAudio.pause();
                }
            });

            audio.addEventListener("pause", () => {
                card.classList.remove("playing");
                if (bgmAudio && !userManuallyPaused) {
                    bgmAudio.play().catch(() => {});
                }
            });

            audio.addEventListener("ended", () => {
                card.classList.remove("playing");
                if (bgmAudio && !userManuallyPaused) {
                    bgmAudio.play().catch(() => {});
                }
            });
        }
    });
}

/* ============================================================
   12. LOGIN PAGE CONTROLLER
============================================================ */

function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim().toLowerCase();
        const message = document.getElementById("loginMessage");
        const card = document.querySelector(".login-card");

        // Ensure BGM plays if not started yet
        if (bgmAudio && bgmAudio.paused && !userManuallyPaused) {
            bgmAudio.play().catch(() => {});
        }

        if (username === "nelson" && password === "bby@08") {
            playChimeSound();
            triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 60);

            message.style.color = "#2e7d32";
            message.textContent = "Welcome to your surprise, my love! ❤️";

            const submitBtn = form.querySelector(".pink-button");
            if (submitBtn) {
                submitBtn.innerHTML = "Opening My Heart... 💖";
                submitBtn.style.transform = "scale(0.96)";
            }

            setTimeout(() => {
                window.location.href = "birthday.html";
            }, 900);
        } else {
            playPopSound();
            if (card) {
                card.classList.remove("shake");
                void card.offsetWidth;
                card.classList.add("shake");
            }
            message.style.color = "#d76591";
            message.textContent = "Hmm... that's not the secret combination. Try again, my love 💗";
        }
    });
}

/* ============================================================
   13. PAGE NAVIGATION & SURPRISE ACTIONS
============================================================ */

function goToSurprise() {
    playChimeSound();
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.7, 50);
    setTimeout(() => {
        window.location.href = "surprise.html";
    }, 600);
}

function sayYes() {
    playChimeSound();
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 120);

    const card = document.querySelector(".surprise-card");
    if (card) {
        card.style.transition = "transform 0.8s ease, opacity 0.8s ease";
        card.style.transform = "scale(1.04)";
    }

    setTimeout(() => {
        window.location.href = "proposal.html";
    }, 1300);
}

/* ============================================================
   14. MULTI-COLOR CONFETTI & HEART CANNON SYSTEM
============================================================ */

function triggerConfettiBurst(originX, originY, count = 50) {
    const colors = ["#e98cae", "#d76591", "#ffd1e0", "#ffb300", "#ffffff", "#f06292", "#ffd54f"];
    const shapes = ["circle", "rect", "heart"];

    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 8 + Math.random() * 12;

        piece.style.position = "fixed";
        piece.style.left = originX + "px";
        piece.style.top = originY + "px";
        piece.style.width = size + "px";
        piece.style.height = (shape === "rect" ? size * 1.6 : size) + "px";
        piece.style.backgroundColor = shape === "heart" ? "transparent" : color;
        piece.style.borderRadius = shape === "circle" ? "50%" : "2px";
        piece.style.zIndex = "999999";
        piece.style.pointerEvents = "none";

        if (shape === "heart") {
            piece.innerHTML = "❤️";
            piece.style.fontSize = size * 1.2 + "px";
            piece.style.lineHeight = "1";
        }

        document.body.appendChild(piece);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 260;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity + 120;
        const rotation = (Math.random() - 0.5) * 720;

        piece.style.transition = "transform 1.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.3s ease-out";

        requestAnimationFrame(() => {
            piece.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${rotation}deg) scale(${0.4 + Math.random() * 0.8})`;
            piece.style.opacity = "0";
        });

        setTimeout(() => piece.remove(), 1400);
    }
}

function createHearts() {
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.7, 40);
}
