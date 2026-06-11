'use strict';

/* ================================================================
   State
   ================================================================ */
const state = {
    selectedFile: null,
    selectedBase64: null,
    isLoading: false,
    activeScreen: 'studio',
    // Flashcard state
    cards: [],
    cardIndex: 0,
    cardFlipped: false,
};

/* ================================================================
   DOM References
   ================================================================ */
const $ = id => document.getElementById(id);

const DOM = {
    imgInput:        $('img_input'),
    imgPreview:      $('img_preview'),
    uploadPlaceholder: $('upload-placeholder'),
    imageSection:    $('image-section'),
    userMsg:         $('user_msg'),
    sendBtn:         $('request_send'),
    loadingOverlay:  $('loading-overlay'),
    toastContainer:  $('toast-container'),
    imageChip:       $('image-chip'),
    chipFilename:    $('chip-filename'),
    chipRemove:      $('chip-remove'),
    headerTitle:     $('header-title'),
    backBtn:         $('back-btn'),
    // Flashcards
    flashcardInner:  $('flashcard-inner'),
    flashcard:       $('flashcard'),
    cardQuestion:    $('card-question'),
    cardAnswer:      $('card-answer'),
    cardCounter:     $('card-counter'),
    progressFill:    $('progress-fill'),
    cardPrev:        $('card-prev'),
    cardNext:        $('card-next'),
    // Summary
    summaryTitle:    $('summary-title'),
    summaryPoints:   $('summary-points'),
    // Mindmap
    mindmapCanvas:   $('mindmap-canvas'),
};

/* ================================================================
   Toast Notification System
   ================================================================ */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
}

/* ================================================================
   Loading State
   ================================================================ */
function setLoading(active) {
    state.isLoading = active;
    DOM.loadingOverlay.classList.toggle('hidden', !active);
    DOM.sendBtn.disabled = active;
}

/* ================================================================
   Screen Routing
   ================================================================ */
const SCREEN_TITLES = {
    studio:     'AI Studio',
    mindmap:    'Mind Map',
    flashcards: 'Flashcards',
    summary:    'Summary',
};

function switchScreen(name) {
    if (state.activeScreen === name) return;

    const prev = document.getElementById(`screen-${state.activeScreen}`);
    const next = document.getElementById(`screen-${name}`);
    if (!next) return;

    // Exit previous
    if (prev) {
        prev.classList.add('exit');
        prev.classList.remove('active');
        setTimeout(() => prev.classList.remove('exit'), 400);
    }

    // Enter next (slight delay for visual overlap)
    setTimeout(() => {
        next.classList.add('active');
    }, 60);

    state.activeScreen = name;
    DOM.headerTitle.textContent = SCREEN_TITLES[name] || 'AI Studio';
}

/* ================================================================
   Image Upload Handler
   ================================================================ */
DOM.imgInput.addEventListener('change', () => {
    const file = DOM.imgInput.files[0];
    if (!file) return;
    handleFile(file);
});

function handleFile(file) {
    state.selectedFile = file;

    // Show chip in chat area
    DOM.chipFilename.textContent = file.name.length > 22 ? file.name.slice(0, 20) + '…' : file.name;
    DOM.imageChip.classList.remove('hidden');

    // Show preview in studio
    const url = URL.createObjectURL(file);
    DOM.imgPreview.src = url;
    DOM.imgPreview.classList.remove('hidden');
    DOM.uploadPlaceholder.classList.add('hidden');
    DOM.imageSection.classList.add('glow-active');

    // Read base64 in background
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        state.selectedBase64 = reader.result.split(',')[1];
    };

    // Switch to studio to show the preview
    switchScreen('studio');
}

function removeImage() {
    state.selectedFile = null;
    state.selectedBase64 = null;
    DOM.imgInput.value = '';
    DOM.imgPreview.src = '';
    DOM.imgPreview.classList.add('hidden');
    DOM.uploadPlaceholder.classList.remove('hidden');
    DOM.imageSection.classList.remove('glow-active');
    DOM.imageChip.classList.add('hidden');
}

DOM.chipRemove.addEventListener('click', removeImage);

/* ================================================================
   Textarea Auto-Grow
   ================================================================ */
DOM.userMsg.addEventListener('input', () => {
    DOM.userMsg.style.height = 'auto';
    DOM.userMsg.style.height = Math.min(DOM.userMsg.scrollHeight, 72) + 'px';
});

/* ================================================================
   Send Handler — Main API Logic
   ================================================================ */
DOM.sendBtn.addEventListener('click', handleSend);
DOM.userMsg.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

async function handleSend() {
    const message = DOM.userMsg.value.trim();
    if (!message && !state.selectedFile) {
        showToast('Type a message or attach an image', 'error');
        return;
    }

    setLoading(true);
    const sentBase64 = state.selectedBase64;

    // Build request body — image is optional
    const body = { message };
    if (sentBase64) {
        body.image_base64 = sentBase64;
        body.mime_type = state.selectedFile?.type || 'image/jpeg';
    }

    // Clear input immediately
    DOM.userMsg.value = '';
    DOM.userMsg.style.height = 'auto';

    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Server error ${response.status}`);
        }

        const data = await response.json();
        const intents = data?.reply?.intents ?? [];

        if (intents.length === 0) {
            showToast('No response from AI', 'error');
            return;
        }

        for (const intent of intents) {
            await routeIntent(intent, sentBase64);
        }

    } catch (err) {
        console.error(err);
        showToast(err.message || 'Connection error — is the server running?', 'error');
    } finally {
        setLoading(false);
    }
}

/* ================================================================
   Intent Router
   ================================================================ */
async function routeIntent(intent, base64) {
    switch (intent.intent_name) {
        case 'image_gen':
            await renderImageGen(intent, base64);
            break;
        case 'mindmap':
            renderMindmap(intent);
            break;
        case 'flashcards':
            renderFlashcards(intent);
            break;
        case 'summary':
            renderSummary(intent);
            break;
        case 'chat':
            showToast(intent.message || 'Message received', 'info', 4000);
            break;
        default:
            showToast(`Unknown intent: ${intent.intent_name}`, 'error');
    }
}

/* ================================================================
   Renderer: Image Gen
   ================================================================ */
async function renderImageGen(intent, base64) {
    switchScreen('studio');

    try {
        const response = await fetch('http://127.0.0.1:8000/image_gen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: intent.prompt,
                ...(base64 && { image_base64: base64 }),
            }),
        });

        if (!response.ok) throw new Error(`Image gen failed: ${response.status}`);

        const data = await response.json();
        const src = 'data:image/png;base64,' + data.image;

        // Smooth crossfade
        DOM.imgPreview.style.transition = 'opacity 0.4s ease';
        DOM.imgPreview.style.opacity = '0';

        setTimeout(() => {
            DOM.imgPreview.src = src;
            DOM.imgPreview.classList.remove('hidden');
            DOM.uploadPlaceholder.classList.add('hidden');
            DOM.imageSection.classList.add('glow-active');
            DOM.imgPreview.onload = () => {
                DOM.imgPreview.style.opacity = '1';
            };
        }, 400);

        showToast('Image generated', 'success');
    } catch (err) {
        console.error(err);
        showToast('Image generation failed', 'error');
    }
}

/* ================================================================
   Renderer: Mind Map
   ================================================================ */
function renderMindmap(intent) {
    switchScreen('mindmap');

    const canvas = DOM.mindmapCanvas;
    canvas.innerHTML = '';

    const NODE_W = 124;
    const NODE_H = 40;
    const H_GAP = 14;   // horizontal gap between sibling subtrees
    const V_GAP = 64;   // vertical gap between levels

    const DEPTH_COLORS = [
        '#FCC419',  // yellow  — root
        '#FA3669',  // pink    — depth 1
        '#4dabf7',  // blue    — depth 2
        '#69db7c',  // green   — depth 3
        '#cc5de8',  // purple  — depth 4
        '#ff8c42',  // orange  — depth 5+
    ];

    // Calculate minimum width needed to display a subtree
    function subtreeWidth(node) {
        if (!node.children || node.children.length === 0 || node._collapsed) {
            return NODE_W;
        }
        const childrenTotal = node.children.reduce(
            (sum, child, i) => sum + subtreeWidth(child) + (i > 0 ? H_GAP : 0),
            0
        );
        return Math.max(NODE_W, childrenTotal);
    }

    // Map: node → { x, y, cx, cy, bottomY, topY }
    const positions = new Map();

    function layout(node, depth, leftX) {
        const sw = subtreeWidth(node);
        const cx = leftX + sw / 2;
        const x = cx - NODE_W / 2;
        const y = depth * (NODE_H + V_GAP);
        positions.set(node, {
            x, y,
            cx,
            cy: y + NODE_H / 2,
            topY: y,
            bottomY: y + NODE_H,
        });

        if (node.children && node.children.length > 0 && !node._collapsed) {
            let left = leftX;
            for (const child of node.children) {
                layout(child, depth + 1, left);
                left += subtreeWidth(child) + H_GAP;
            }
        }
    }

    function rerender() {
        canvas.innerHTML = '';
        positions.clear();

        // Center the tree horizontally within the wrapper
        const wrapperW = DOM.mindmapCanvas.parentElement.offsetWidth || 350;
        const totalW = subtreeWidth(intent);
        const startX = Math.max(10, (wrapperW - totalW) / 2);

        layout(intent, 0, startX);

        // Measure canvas size
        let maxX = 0, maxY = 0;
        positions.forEach(p => {
            maxX = Math.max(maxX, p.x + NODE_W);
            maxY = Math.max(maxY, p.y + NODE_H);
        });
        const canvasW = Math.max(wrapperW - 24, maxX + 20);
        const canvasH = maxY + 30;

        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';

        // ── SVG Edge Layer ──────────────────────────────
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', canvasW);
        svg.setAttribute('height', canvasH);
        svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;overflow:visible;';
        canvas.appendChild(svg);

        function drawEdges(node) {
            if (!node.children || node._collapsed) return;
            const pp = positions.get(node);
            node.children.forEach(child => {
                const cp = positions.get(child);
                if (!pp || !cp) return;

                const x1 = pp.cx, y1 = pp.bottomY;
                const x2 = cp.cx, y2 = cp.topY;
                const midY = (y1 + y2) / 2;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'rgba(252,196,25,0.18)');
                path.setAttribute('stroke-width', '1.5');
                svg.appendChild(path);

                drawEdges(child);
            });
        }
        drawEdges(intent);

        // ── DOM Node Layer ──────────────────────────────
        function drawNodes(node, depth) {
            const pos = positions.get(node);
            if (!pos) return;

            const color = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
            const hasChildren = node.children && node.children.length > 0;

            const el = document.createElement('div');
            el.className = 'mm-node'
                + (depth === 0 ? ' mm-root' : '')
                + (hasChildren ? ' mm-has-children' : '');
            el.style.cssText =
                `left:${pos.x}px;top:${pos.y}px;` +
                `width:${NODE_W}px;height:${NODE_H}px;` +
                `border-color:${color};`;

            const textSpan = document.createElement('span');
            textSpan.className = 'mm-text';
            textSpan.title = node.name;
            textSpan.textContent = node.name;
            el.appendChild(textSpan);

            if (hasChildren) {
                const badge = document.createElement('span');
                badge.className = 'mm-badge';
                badge.style.color = color;
                badge.textContent = node._collapsed ? `+${node.children.length}` : '−';
                el.appendChild(badge);

                el.addEventListener('click', () => {
                    node._collapsed = !node._collapsed;
                    rerender();
                });
            }

            canvas.appendChild(el);

            if (!node._collapsed && node.children) {
                node.children.forEach(child => drawNodes(child, depth + 1));
            }
        }
        drawNodes(intent, 0);
    }

    rerender();
}

/* ================================================================
   Renderer: Flashcards
   ================================================================ */
function renderFlashcards(intent) {
    switchScreen('flashcards');

    state.cards = intent.cards || [];
    state.cardIndex = 0;
    state.cardFlipped = false;

    if (state.cards.length === 0) {
        showToast('No flashcards in response', 'error');
        return;
    }

    updateCardDisplay();
}

function updateCardDisplay() {
    const card = state.cards[state.cardIndex];
    if (!card) return;

    // Reset flip
    state.cardFlipped = false;
    DOM.flashcardInner.classList.remove('flipped');

    DOM.cardQuestion.textContent = card.question || card.front || '';
    DOM.cardAnswer.textContent = card.answer || card.back || '';

    // Update counter
    const total = state.cards.length;
    const current = state.cardIndex + 1;
    DOM.cardCounter.textContent = `${current} / ${total}`;

    // Update progress bar
    DOM.progressFill.style.width = `${(current / total) * 100}%`;

    // Update nav buttons
    DOM.cardPrev.disabled = state.cardIndex === 0;
    DOM.cardNext.disabled = state.cardIndex === total - 1;
}

function flipCard() {
    state.cardFlipped = !state.cardFlipped;
    DOM.flashcardInner.classList.toggle('flipped', state.cardFlipped);
}

function prevCard() {
    if (state.cardIndex > 0) {
        state.cardIndex--;
        updateCardDisplay();
    }
}

function nextCard() {
    if (state.cardIndex < state.cards.length - 1) {
        state.cardIndex++;
        updateCardDisplay();
    }
}

/* ================================================================
   Renderer: Summary
   ================================================================ */
function renderSummary(intent) {
    switchScreen('summary');

    DOM.summaryTitle.textContent = intent.title || 'Summary';
    DOM.summaryPoints.innerHTML = '';

    const points = intent.key_points || intent.points || [];

    points.forEach((point, i) => {
        const li = document.createElement('li');
        li.textContent = point;
        li.style.animationDelay = `${i * 80}ms`;
        DOM.summaryPoints.appendChild(li);
    });

    if (points.length === 0) {
        showToast('No key points found in response', 'error');
    }
}

/* ================================================================
   Back Button — return to studio
   ================================================================ */
DOM.backBtn.addEventListener('click', () => {
    if (state.activeScreen !== 'studio') {
        switchScreen('studio');
    }
});

/* ================================================================
   Flashcard Global Listeners (registered once)
   ================================================================ */
DOM.flashcard.addEventListener('click', flipCard);
DOM.cardPrev.addEventListener('click', prevCard);
DOM.cardNext.addEventListener('click', nextCard);
