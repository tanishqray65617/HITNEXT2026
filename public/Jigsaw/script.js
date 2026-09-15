const CONFIG = {
    imageSrc: "jigsawimg.png",
    cols: 8,
    rows: 5,
    snapDistance: 35,
    enableRotation: false, // Core mechanics focus, rotation not implemented to ensure stability
    enableSound: false,
    showPreviewButton: true,
    showTimer: true
};

// Global State
let pieces = [];
let groups = [];
let imgWidth = 0;
let imgHeight = 0;
let pieceW = 0;
let pieceH = 0;
let timerInterval = null;
let secondsElapsed = 0;
let isSolved = false;

// DOM Elements
const svg = document.getElementById('puzzle-svg');
const defs = document.getElementById('puzzle-defs');
const piecesLayer = document.getElementById('pieces-layer');
const targetArea = document.getElementById('target-area');
const previewLayer = document.getElementById('preview-layer');

const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const percentageText = document.getElementById('percentage-text');
const timerEl = document.getElementById('timer');

const btnPreview = document.getElementById('btn-preview');
const btnShuffle = document.getElementById('btn-shuffle');
const btnReset = document.getElementById('btn-reset');
const btnPlayAgain = document.getElementById('btn-play-again');

const completionOverlay = document.getElementById('completion-overlay');
const errorOverlay = document.getElementById('error-overlay');
const finalStats = document.getElementById('final-stats');
const finalTime = document.getElementById('final-time');

// ----------------------------------------------------
// Initialization
// ----------------------------------------------------

async function init() {
    try {
        const img = new Image();
        img.src = CONFIG.imageSrc;
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // Setup Workspace Coordinates (Base 16:9 like 1280x720 if possible)
        imgWidth = img.width;
        imgHeight = img.height;
        
        // Ensure ratio is roughly maintained, but we use the image's exact dimensions
        // as the puzzle coordinate system.
        const svgRect = svg.getBoundingClientRect();
        
        // Create an aspect ratio box for the target area
        const targetW = imgWidth;
        const targetH = imgHeight;
        
        // We will set viewBox so 0,0 to maxW, maxH is visible
        // We want a large workspace, say 2.5x the width and height
        const viewW = targetW * 2.5;
        const viewH = targetH * 2.5;
        const viewX = -targetW * 0.75;
        const viewY = -targetH * 0.75;
        
        svg.setAttribute('viewBox', `${viewX} ${viewY} ${viewW} ${viewH}`);

        // Setup Target Area visual
        targetArea.innerHTML = `<rect x="0" y="0" width="${targetW}" height="${targetH}" class="target-outline" rx="5" />`;
        
        // Setup Preview Layer
        previewLayer.innerHTML = `<image href="${CONFIG.imageSrc}" x="0" y="0" width="${targetW}" height="${targetH}" />`;
        
        generatePuzzle();
        startTimer();

    } catch (e) {
        errorOverlay.classList.remove('hidden');
    }
}

// ----------------------------------------------------
// Puzzle Generation
// ----------------------------------------------------

function generatePuzzle() {
    pieces = [];
    groups = [];
    defs.innerHTML = '';
    piecesLayer.innerHTML = '';
    
    pieceW = imgWidth / CONFIG.cols;
    pieceH = imgHeight / CONFIG.rows;
    
    // Generate Edge Topology
    // 1: Tab out, -1: Slot in, 0: Flat
    const hEdges = []; // horizontal edges (cols-1) x rows
    for (let r = 0; r < CONFIG.rows; r++) {
        const rowEdges = [];
        for (let c = 0; c < CONFIG.cols - 1; c++) {
            rowEdges.push(Math.random() > 0.5 ? 1 : -1);
        }
        hEdges.push(rowEdges);
    }
    
    const vEdges = []; // vertical edges cols x (rows-1)
    for (let c = 0; c < CONFIG.cols; c++) {
        const colEdges = [];
        for (let r = 0; r < CONFIG.rows - 1; r++) {
            colEdges.push(Math.random() > 0.5 ? 1 : -1);
        }
        vEdges.push(colEdges);
    }

    // Create Pieces
    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.cols; c++) {
            const topEdge = r === 0 ? 0 : -vEdges[c][r - 1]; // opposite of the one above
            const rightEdge = c === CONFIG.cols - 1 ? 0 : hEdges[r][c];
            const bottomEdge = r === CONFIG.rows - 1 ? 0 : vEdges[c][r];
            const leftEdge = c === 0 ? 0 : -hEdges[r][c - 1]; // opposite of the one to the left
            
            createPiece(c, r, topEdge, rightEdge, bottomEdge, leftEdge);
        }
    }
    
    // Setup neighbors
    pieces.forEach(p => {
        p.neighbors = {
            top: p.r > 0 ? getPieceId(p.c, p.r - 1) : null,
            right: p.c < CONFIG.cols - 1 ? getPieceId(p.c + 1, p.r) : null,
            bottom: p.r < CONFIG.rows - 1 ? getPieceId(p.c, p.r + 1) : null,
            left: p.c > 0 ? getPieceId(p.c - 1, p.r) : null
        };
    });

    scatterPieces();
    updateProgress();
}

function getPieceId(c, r) {
    return `piece-${c}-${r}`;
}

function createPiece(c, r, top, right, bottom, left) {
    const id = getPieceId(c, r);
    const baseX = c * pieceW;
    const baseY = r * pieceH;
    
    const S = Math.min(pieceW, pieceH);
    
    // Points of the rectangle
    const pTL = {x: baseX, y: baseY};
    const pTR = {x: baseX + pieceW, y: baseY};
    const pBR = {x: baseX + pieceW, y: baseY + pieceH};
    const pBL = {x: baseX, y: baseY + pieceH};
    
    let d = `M ${pTL.x} ${pTL.y}`;
    d += createEdgePath(pTL, pTR, top, S);
    d += createEdgePath(pTR, pBR, right, S);
    d += createEdgePath(pBR, pBL, bottom, S);
    d += createEdgePath(pBL, pTL, left, S);
    d += " Z";
    
    // Clip path for the image
    const clipId = `clip-${id}`;
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clipPath.id = clipId;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('d', d);
    clipPath.appendChild(path);
    defs.appendChild(clipPath);
    
    // Group representing the individual piece
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = id;
    g.classList.add('puzzle-piece');
    
    // Outline (for shadow and border)
    const outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
    outline.setAttribute('d', d);
    outline.setAttribute('fill', 'transparent');
    outline.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    outline.setAttribute('stroke-width', '1');
    
    // Image element clipped to piece shape
    const imgElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imgElement.setAttribute('href', CONFIG.imageSrc);
    imgElement.setAttribute('width', imgWidth);
    imgElement.setAttribute('height', imgHeight);
    imgElement.setAttribute('clip-path', `url(#${clipId})`);
    
    g.appendChild(imgElement);
    g.appendChild(outline);
    piecesLayer.appendChild(g);
    
    // Create state object
    const pieceState = {
        id: id,
        c: c,
        r: r,
        element: g,
        targetX: baseX,
        targetY: baseY,
        group: id, // initially in its own group
        tx: 0, // current translation
        ty: 0
    };
    
    pieces.push(pieceState);
    
    // Create group state
    groups.push({
        id: id,
        members: [id],
        tx: 0,
        ty: 0,
        element: null // We don't use SVG grouping to wrap pieces to keep transformations simple, we just apply transform to all members
    });
}

function createEdgePath(p1, p2, tabType, S) {
    if (tabType === 0) {
        return ` L ${p2.x} ${p2.y}`;
    }
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const L = Math.hypot(dx, dy);
    const ux = dx / L;
    const uy = dy / L;
    const nx = -uy;
    const ny = ux;
    
    const th = tabType * S * 0.22; 
    
    const pt = (t, n) => ({
        x: p1.x + t * dx + n * nx * th,
        y: p1.y + t * dy + n * ny * th
    });

    const c1 = pt(0.2, 0), c2 = pt(0.35, -0.05), t1 = pt(0.35, 0.2); 
    const c3 = pt(0.35, 0.6), c4 = pt(0.2, 0.8), t2 = pt(0.3, 1);   
    const c5 = pt(0.4, 1.1), c6 = pt(0.6, 1.1), t3 = pt(0.7, 1);    
    const c7 = pt(0.8, 0.8), c8 = pt(0.65, 0.6), t4 = pt(0.65, 0.2); 
    const c9 = pt(0.65, -0.05), c10 = pt(0.8, 0), t5 = pt(1, 0);      
    
    return ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${t1.x} ${t1.y}` +
           ` C ${c3.x} ${c3.y}, ${c4.x} ${c4.y}, ${t2.x} ${t2.y}` +
           ` C ${c5.x} ${c5.y}, ${c6.x} ${c6.y}, ${t3.x} ${t3.y}` +
           ` C ${c7.x} ${c7.y}, ${c8.x} ${c8.y}, ${t4.x} ${t4.y}` +
           ` C ${c9.x} ${c9.y}, ${c10.x} ${c10.y}, ${t5.x} ${t5.y}`;
}

// ----------------------------------------------------
// Scatter Logic
// ----------------------------------------------------

function scatterPieces() {
    const viewW = imgWidth * 2.5;
    const viewH = imgHeight * 2.5;
    const viewX = -imgWidth * 0.75;
    const viewY = -imgHeight * 0.75;
    
    const margin = pieceW;
    
    // Only scatter pieces, keep grouped ones together if implemented later
    pieces.forEach(p => {
        // Find a random position in the view, avoiding the direct center target area mostly
        let rx, ry;
        let isInsideTarget = true;
        while(isInsideTarget) {
            rx = viewX + margin + Math.random() * (viewW - margin * 2 - pieceW);
            ry = viewY + margin + Math.random() * (viewH - margin * 2 - pieceH);
            
            // Check if it overlaps heavily with the center (0,0 to imgW,imgH)
            if (rx > -pieceW && rx < imgWidth && ry > -pieceH && ry < imgHeight) {
                if (Math.random() > 0.8) isInsideTarget = false; // 20% chance to allow inside
            } else {
                isInsideTarget = false;
            }
        }
        
        // tx, ty is the offset from the base coordinates
        p.tx = rx - p.targetX;
        p.ty = ry - p.targetY;
        
        updatePieceTransform(p);
    });
}

function updatePieceTransform(p) {
    p.element.setAttribute('transform', `translate(${p.tx}, ${p.ty})`);
}

// ----------------------------------------------------
// Interaction & Dragging
// ----------------------------------------------------

let activeGroup = null;
let dragStartX = 0;
let dragStartY = 0;
let groupStartTx = 0;
let groupStartTy = 0;

svg.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.puzzle-piece')) {
        const pieceId = e.target.closest('.puzzle-piece').id;
        const p = pieces.find(x => x.id === pieceId);
        
        // Find group
        const group = groups.find(g => g.id === p.group);
        activeGroup = group;
        
        // Bring group to front visually
        group.members.forEach(mId => {
            const m = pieces.find(x => x.id === mId);
            m.element.classList.add('dragging');
            piecesLayer.appendChild(m.element); // moves to end of parent (top of stack)
        });
        
        const pt = getMousePosition(e);
        dragStartX = pt.x;
        dragStartY = pt.y;
        
        // All members in a group have the same tx, ty
        groupStartTx = p.tx;
        groupStartTy = p.ty;
        
        svg.setPointerCapture(e.pointerId);
    }
});

svg.addEventListener('pointermove', (e) => {
    if (!activeGroup) return;
    
    const pt = getMousePosition(e);
    const dx = pt.x - dragStartX;
    const dy = pt.y - dragStartY;
    
    // Update all members of the group
    activeGroup.members.forEach(mId => {
        const m = pieces.find(x => x.id === mId);
        m.tx = groupStartTx + dx;
        m.ty = groupStartTy + dy;
        updatePieceTransform(m);
    });
});

svg.addEventListener('pointerup', (e) => {
    if (!activeGroup) return;
    
    activeGroup.members.forEach(mId => {
        const m = pieces.find(x => x.id === mId);
        m.element.classList.remove('dragging');
    });
    
    svg.releasePointerCapture(e.pointerId);
    
    checkForSnaps(activeGroup);
    
    activeGroup = null;
});

svg.addEventListener('pointercancel', (e) => {
    if (!activeGroup) return;
    activeGroup.members.forEach(mId => {
        const m = pieces.find(x => x.id === mId);
        m.element.classList.remove('dragging');
    });
    activeGroup = null;
});

function getMousePosition(evt) {
    const CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

// ----------------------------------------------------
// Snapping Logic
// ----------------------------------------------------

function checkForSnaps(movedGroup) {
    let snapped = false;
    let groupToMergeWith = null;
    let snapOffsetX = 0;
    let snapOffsetY = 0;

    // Check exposed edges of the moved group against valid neighbors not in the group
    for (const mId of movedGroup.members) {
        const p = pieces.find(x => x.id === mId);
        
        for (const dir in p.neighbors) {
            const neighborId = p.neighbors[dir];
            if (neighborId && !movedGroup.members.includes(neighborId)) {
                const neighbor = pieces.find(x => x.id === neighborId);
                
                // Compare transformations
                // Since base coordinates are absolute and perfectly aligned,
                // if tx and ty match, the pieces are perfectly aligned.
                const diffX = p.tx - neighbor.tx;
                const diffY = p.ty - neighbor.ty;
                const dist = Math.hypot(diffX, diffY);
                
                if (dist < CONFIG.snapDistance) {
                    snapped = true;
                    groupToMergeWith = groups.find(g => g.id === neighbor.group);
                    
                    // We want to snap movedGroup to groupToMergeWith
                    snapOffsetX = neighbor.tx - p.tx;
                    snapOffsetY = neighbor.ty - p.ty;
                    break;
                }
            }
        }
        if (snapped) break;
    }
    
    // If snapped, align the moved group and merge
    if (snapped && groupToMergeWith) {
        // Align visually
        movedGroup.members.forEach(mId => {
            const m = pieces.find(x => x.id === mId);
            m.tx += snapOffsetX;
            m.ty += snapOffsetY;
            updatePieceTransform(m);
            // Flash effect
            m.element.animate([
                { filter: 'brightness(1.5)' },
                { filter: 'brightness(1)' }
            ], { duration: 300 });
        });
        
        // Target area snap check
        // If the combined group's tx and ty are very close to 0 (the target coords), snap to target
        
        // Merge logic
        mergeGroups(movedGroup, groupToMergeWith);
        
        // Check for cascading snaps (rare but possible if sliding between two pieces)
        const newGroup = groups.find(g => g.id === movedGroup.id);
        checkForSnaps(newGroup); // recursive check for multi-snaps
    } else {
        // Target area snap check if no pieces snapped
        // Check if the group is close to its true absolute position (tx=0, ty=0)
        const p0 = pieces.find(x => x.id === movedGroup.members[0]);
        if (Math.hypot(p0.tx, p0.ty) < CONFIG.snapDistance) {
            movedGroup.members.forEach(mId => {
                const m = pieces.find(x => x.id === mId);
                m.tx = 0;
                m.ty = 0;
                updatePieceTransform(m);
            });
            // Flash effect for correct placement
            movedGroup.members.forEach(mId => {
                const m = pieces.find(x => x.id === mId);
                m.element.animate([
                    { filter: 'drop-shadow(0 0 10px #4e8cff)' },
                    { filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }
                ], { duration: 500 });
            });
        }
    }
    
    updateProgress();
    checkCompletion();
}

function mergeGroups(groupA, groupB) {
    // Merge B into A
    groupB.members.forEach(mId => {
        const m = pieces.find(x => x.id === mId);
        m.group = groupA.id;
        groupA.members.push(mId);
    });
    
    // Remove B
    groups = groups.filter(g => g.id !== groupB.id);
}

// ----------------------------------------------------
// Game Loop & UI
// ----------------------------------------------------

function startTimer() {
    stopTimer();
    secondsElapsed = 0;
    updateTimerUI();
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerUI();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerUI() {
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
}

function updateProgress() {
    const totalConnections = (CONFIG.cols - 1) * CONFIG.rows + CONFIG.cols * (CONFIG.rows - 1);
    let currentConnections = 0;
    
    // Count internal connections within all groups
    groups.forEach(g => {
        if (g.members.length > 1) {
            // Number of connections in a spanning tree of n nodes is n - 1.
            // But for grid puzzles, groups might form loops.
            // Actually, we can just check each piece's right and bottom neighbors.
            g.members.forEach(mId => {
                const p = pieces.find(x => x.id === mId);
                if (p.neighbors.right && g.members.includes(p.neighbors.right)) currentConnections++;
                if (p.neighbors.bottom && g.members.includes(p.neighbors.bottom)) currentConnections++;
            });
        }
    });
    
    // Connected pieces metric (how many pieces are not isolated)
    const connectedPiecesCount = pieces.filter(p => {
        const g = groups.find(x => x.id === p.group);
        return g.members.length > 1;
    }).length;
    
    const percentage = totalConnections === 0 ? 0 : Math.round((currentConnections / totalConnections) * 100);
    
    progressText.textContent = `${connectedPiecesCount} / ${pieces.length} pieces connected`;
    progressBar.style.width = `${percentage}%`;
    percentageText.textContent = `${percentage}%`;
}

function checkCompletion() {
    if (groups.length === 1) {
        // Check if it's perfectly placed at tx=0, ty=0
        const g = groups[0];
        const p = pieces.find(x => x.id === g.members[0]);
        if (Math.abs(p.tx) < 1 && Math.abs(p.ty) < 1) {
            if (!isSolved) {
                isSolved = true;
                stopTimer();
                showCompletion();
            }
        }
    }
}

function showCompletion() {
    finalTime.textContent = timerEl.textContent;
    completionOverlay.classList.remove('hidden');
    
    // Notify parent window that the puzzle is solved
    window.parent.postMessage({ type: 'JIGSAW_SOLVED' }, '*');
    
    // Celebration animation on the target area
    targetArea.innerHTML = `<rect x="0" y="0" width="${imgWidth}" height="${imgHeight}" fill="rgba(255,255,255,0.2)" rx="5" />`;
    setTimeout(() => {
        targetArea.innerHTML = `<rect x="0" y="0" width="${imgWidth}" height="${imgHeight}" class="target-outline" rx="5" />`;
    }, 500);
}

// ----------------------------------------------------
// Controls
// ----------------------------------------------------

btnPreview.addEventListener('pointerdown', () => {
    previewLayer.style.opacity = '0.3';
});
btnPreview.addEventListener('pointerup', () => {
    previewLayer.style.opacity = '0';
});
btnPreview.addEventListener('pointerleave', () => {
    previewLayer.style.opacity = '0';
});

btnShuffle.addEventListener('click', () => {
    // Option B: Keep connected groups together and shuffle their positions
    const viewW = imgWidth * 2.5;
    const viewH = imgHeight * 2.5;
    const viewX = -imgWidth * 0.75;
    const viewY = -imgHeight * 0.75;
    const margin = pieceW;
    
    groups.forEach(g => {
        const rx = viewX + margin + Math.random() * (viewW - margin * 2 - pieceW);
        const ry = viewY + margin + Math.random() * (viewH - margin * 2 - pieceH);
        
        // Find offset for the group (relative to base 0,0)
        // Set the tx/ty of the first member to this rx/ry minus its target
        const p0 = pieces.find(x => x.id === g.members[0]);
        const newTx = rx - p0.targetX;
        const newTy = ry - p0.targetY;
        
        g.members.forEach(mId => {
            const m = pieces.find(x => x.id === mId);
            m.tx = newTx;
            m.ty = newTy;
            updatePieceTransform(m);
        });
    });
});

btnReset.addEventListener('click', () => {
    isSolved = false;
    completionOverlay.classList.add('hidden');
    generatePuzzle();
    startTimer();
});

btnPlayAgain.addEventListener('click', () => {
    btnReset.click();
});

// Start
window.onload = init;
