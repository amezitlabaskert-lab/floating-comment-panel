/* =========================================================
   LEBEGŐ KOMMENT DRAWER — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Tab fizikailag a panel bal széle, együtt csúsznak
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül
   - "Csicsergő" felirat külső label, elforgva a tab bal szélén
   ========================================================= */

/* ── Strukturális + skin-független CSS injektálása ── */
(function injectDrawerStyles() {
    if (document.getElementById('fcp-styles')) return;
    var style = document.createElement('style');
    style.id = 'fcp-styles';
    style.textContent = `
/* ── DRAWER ── */
#floating-comment-drawer {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    z-index: 100004;
    transform: translateX(440px);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    visibility: hidden;
}
#floating-comment-drawer.is-visible {
    pointer-events: auto;
    visibility: visible;
}
#floating-comment-drawer.is-open {
    transform: translateX(0);
}

/* ── TAB ── */
#floating-comment-btn {
    width: 40px !important;
    height: 140px !important;
    align-self: flex-end;
    margin-bottom: 60px;
    flex-shrink: 0;
    position: relative;
    overflow: visible !important;
    background-clip: padding-box !important;
    box-sizing: border-box !important;
    border: 8px solid rgba(255, 255, 255, 0.5) !important;
    border-right: none !important;
    border-radius: 10px 0 0 10px !important;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0 !important;
    color: #fff;
    transition: background 0.18s;
}

/* ── LABEL ── */
#floating-comment-label {
    position: absolute;
    top: 50%;
    left: -37%;
    transform: translate(-50%, -50%) rotate(-90deg);
    transform-origin: center center;
    background: transparent;
    font-family: 'Dancing Script', cursive !important;
    font-size: 36px;
    padding: 5px 18px;
    border-radius: 8px 8px 0 0;
    white-space: nowrap;
    z-index: 2;
    pointer-events: none;
    box-shadow: none;
    text-shadow: 0 1px 5px rgba(0,0,0,0.55), 0 0 10px rgba(0,0,0,0.25);
}

/* ── HEADER ICON + BIRD ── */
#floating-comment-header-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
}
.bird-icon {
    position: absolute;
    top: -31px;
    left: 50%;
    margin-left: -3px;
    transform: translateX(-50%);
    font-size: 30px;
    line-height: 1;
    display: block;
    animation: birdChirp 4s ease-in-out infinite;
    transform-origin: bottom center;
}
@keyframes birdChirp {
    0%, 100% { transform: translateX(-50%) scale(1) rotate(0deg); }
    5%        { transform: translateX(-50%) scale(1.1) rotate(-8deg); }
    10%       { transform: translateX(-50%) scale(1.1) rotate(8deg); }
    15%       { transform: translateX(-50%) scale(1.1) rotate(-4deg); }
    20%       { transform: translateX(-50%) scale(1) rotate(0deg); }
    60%       { transform: translateX(-50%) scale(1) rotate(0deg); }
    65%       { transform: translateX(-50%) scale(1.15); }
    70%       { transform: translateX(-50%) scale(1); }
}
#comment-count-display {
    font-family: sans-serif;
    font-size: 12px;
    margin-top: 2px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* ── PANEL ── */
#floating-comment-panel {
    width: 440px;
    max-width: calc(100vw - 36px);
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 28px rgba(0, 0, 0, 0.13);
    overflow: hidden;
}

/* ── PANEL HEADER ── */
#floating-comment-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 18px;
    color: #fff;
    font-family: 'Dancing Script', cursive !important;
    font-size: 1.8em !important;
    font-weight: 600;
    flex-shrink: 0;
}
#floating-comment-header span:first-child {
    font-size: 20px;
}

/* ── BEZÁRÓGOMB ── */
#floating-comment-close {
    margin-left: auto;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
#floating-comment-close:hover {
    color: #fff;
}

/* ── BODY ── */
#floating-comment-body {
    overflow-y: auto;
    flex: 1;
    padding: 16px;
    -webkit-overflow-scrolling: touch;
}
#floating-comment-body #echothread {
    margin-top: 0 !important;
}

/* ── FOOTER ── */
#floating-comment-footer {
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    text-align: right;
    padding: 5px 13px;
    flex-shrink: 0;
    letter-spacing: 0.5px;
}

/* ── ECHOTHREAD OVERRIDES ── */
.et-format-hint {
    display: none !important;
}
.et-header {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    padding-bottom: 10px !important;
    border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.et-bell-dropdown {
    transform: translateX(100px) !important;
}
.et-footer {
    display: none !important;
}

/* ── Like picker hover delay ── */
.et-reaction-wrap .et-reaction-picker {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.1s, visibility 0.1s;
    transition-delay: 0s;
}
.et-reaction-wrap:hover .et-reaction-picker {
    visibility: visible;
    opacity: 1;
    transition-delay: 200ms;
}

/* ── Reaction picker háttér + ikonméret ── */
.et-reaction-picker {
    background: #ffffff !important;
    border-radius: 0 !important;
    box-shadow: none !important;
}
.et-reaction-option {
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    font-size: 22px !important;
}

/* ── MOBIL ── */
@media (max-width: 768px) {
    #floating-comment-drawer {
        top: auto;
        right: 0;
        left: 0;
        bottom: 0;
        flex-direction: column;
        align-items: stretch;
        transform: translateY(calc(70vh + 44px));
    }
    #floating-comment-drawer.is-open {
        transform: translateY(0);
    }
    #floating-comment-btn {
        width: 100%;
        height: 44px;
        border-radius: 12px 12px 0 0;
        flex-direction: row;
        gap: 8px;
        box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.13);
    }
    #floating-comment-panel {
        width: 100%;
        max-width: 100vw;
        height: 70vh;
    }
}
    `;
    document.head.appendChild(style);
})();


/* ── DOM felépítése ── */
function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-drawer')) return;

    var FCP_VERSION = '6.7';

    var drawer = document.createElement('div');
    drawer.id = 'floating-comment-drawer';

    var btn = document.createElement('button');
    btn.id = 'floating-comment-btn';
    btn.setAttribute('aria-label', 'Csicsergő megnyitása');
    btn.innerHTML =
        '<div id="floating-comment-label">Csicsergő</div>' +
        '<div id="floating-comment-header-icon">' +
            '<span class="bird-icon">🐦</span>' +
            '<span id="comment-count-display"></span>' +
        '</div>';
    drawer.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'floating-comment-panel';
    panel.innerHTML =
        '<div id="floating-comment-header">' +
            '<button id="floating-comment-close" aria-label="Csicsergő bezárása">✕</button>' +
        '</div>' +
        '<div id="floating-comment-body">' +
            '<div id="echothread" ' +
                 'data-shortname="mezitlabaskert" ' +
                 'data-api-key="-_Bx_aoOvDh-6sANgDStoZC-f9I6GCwlTFiSVuIJuZQ">' +
            '</div>' +
        '</div>' +
        '<div id="floating-comment-footer">v' + FCP_VERSION + '</div>';

    drawer.appendChild(panel);
    document.body.appendChild(drawer);

    btn.addEventListener('click', function () {
        _toggleFloatingPanel();
    });

    panel.querySelector('#floating-comment-close').addEventListener('click', function () {
        _closeFloatingPanel();
    });

    var targetNode = panel.querySelector('#floating-comment-body');
    if (targetNode) {
        var updateTimer;
        new MutationObserver(function () {
            clearTimeout(updateTimer);
            updateTimer = setTimeout(function () {
                syncEtCommentCount();
                magyaritEchoThread();
            }, 150);
        }).observe(targetNode, { childList: true, subtree: true });
    }
}


/* ── EchoThread kommentszám szinkronizálása a tabra ── */
function syncEtCommentCount() {
    var container = document.getElementById('floating-comment-body');
    var countDisplay = document.getElementById('comment-count-display');
    var header = document.getElementById('my-custom-comment-count');
    if (!container || !countDisplay) return;

    // Az EchoThread a teljes kommentszámot (válaszokkal együtt) a
    // .et-comment-count elemben jeleníti meg – ezt másoljuk a tabra.
    var etCount = container.querySelector('.et-comment-count');
    var total = 0;
    if (etCount) {
        var parsed = parseInt(etCount.textContent, 10);
        if (!isNaN(parsed)) total = parsed;
    }

    countDisplay.textContent = '(' + total + ')';
    if (header) header.textContent = total > 0 ? ' (' + total + ')' : '';
}


/* ── Magyar fordítás (EchoThread) ── */
function magyaritEchoThread() {
    var container = document.getElementById('floating-comment-body');
    if (!container) return;

    var placeholders = {
        'Write a comment…': 'Szólj hozzá…',
        'Write a reply…': 'Válaszolj…',
        'Your name': 'Neved',
        'Email (optional, never shown)': 'Email (nem kötelező, nem látható)',
    };
    container.querySelectorAll('[placeholder]').forEach(function (el) {
        var p = el.getAttribute('placeholder');
        if (placeholders[p]) el.setAttribute('placeholder', placeholders[p]);
    });

    container.querySelectorAll('[data-placeholder]').forEach(function (el) {
        var p = el.getAttribute('data-placeholder');
        if (placeholders[p]) el.setAttribute('data-placeholder', placeholders[p]);
    });

    var ariaLabels = {
        'Write a comment': 'Írj egy hozzászólást',
        'Your name': 'Neved',
        'Email (optional, never shown publicly)': 'Email (nem kötelező, nem látható)',
        'Post comment': 'Küldés',
        'Attach an image': 'Kép csatolása',
        'Insert emoji': 'Emoji',
        'Sign in with Google': 'Belépés Google-lel',
        'Sign in with X': 'Belépés X-szel',
        'Sign in with Facebook': 'Belépés Facebookkal',
        'Remove attached image': 'Kép eltávolítása',
        'Sign in (optional)': 'Bejelentkezés (nem kötelező)',
        'Emoji picker': 'Emoji választó',
        'Notifications': 'Értesítések',
        'Copy link to this comment': 'Hivatkozás másolása',
        'Bold': 'Félkövér',
        'Italic': 'Dőlt',
        'Strikethrough': 'Áthúzott',
        'Spoiler': 'Spoiler',
    };
    container.querySelectorAll('[aria-label]').forEach(function (el) {
        var lbl = el.getAttribute('aria-label');
        if (ariaLabels[lbl]) el.setAttribute('aria-label', ariaLabels[lbl]);
        if (lbl && lbl.startsWith('View ') && lbl.endsWith("'s profile")) {
            el.setAttribute('aria-label', 'Profil megtekintése');
        }
        if (lbl && lbl.startsWith('Verified site owner')) {
            el.setAttribute('aria-label', 'Főkertész');
        }
    });

    var titles = {
        'Remove image': 'Kép eltávolítása',
        'View profile': 'Profil megtekintése',
        'Copy link': 'Hivatkozás másolása',
        'More options': 'További lehetőségek',
        'Pin to top': 'Rögzítés az elejére',
        'Like': 'Tetszik',
        'Love': 'Imádom',
        'Haha': 'Haha',
        'Angry': 'Dühös',
        'Sad': 'Szomorú',
        'Add emoji': 'Emoji hozzáadása',
        'Add photo': 'Kép hozzáadása',
        'Post comment': 'Küldés',
        'Bold': 'Félkövér',
        'Italic': 'Dőlt',
        'Strikethrough': 'Áthúzott',
        'Spoiler': 'Spoiler',
    };
    container.querySelectorAll('[title]').forEach(function (el) {
        var t = el.getAttribute('title');
        if (!t) return;
        if (titles[t]) { el.setAttribute('title', titles[t]); return; }
        var dashIdx = t.indexOf(' —');
        if (dashIdx !== -1) {
            var prefix = t.slice(0, dashIdx);
            var suffix = t.slice(dashIdx);
            if (titles[prefix]) { el.setAttribute('title', titles[prefix] + suffix); return; }
        }
        if (t.startsWith('Verified owner')) {
            el.setAttribute('title', 'Főkertész');
        }
    });

    var szovegek = {
        'Best': 'Legjobb',
        'Newest': 'Legújabb',
        'Oldest': 'Legrégebbi',
        'Most liked': 'Legtöbb like',
        'Most replied': 'Legtöbb válasz',
        'Show the highest-rated recent comments first.': 'A legjobban értékelt kommentek elöl.',
        'Show the newest comments first.': 'A legújabb kommentek elöl.',
        'Show the oldest comments first.': 'A legrégebbi kommentek elöl.',
        'Show the most liked comments first (lifetime).': 'A legtöbb like-ot kapott kommentek elöl.',
        'Show the most discussed comments first.': 'A legtöbbet válaszolt kommentek elöl.',
        'Post': 'Küldés',
        'or sign in': 'vagy jelentkezz be',
        'Optional. Sign in to react to comments, get notified of replies, and post under a name that\'s yours.': 'Nem kötelező. Belépve reagálhatsz, értesítést kapsz a válaszokról.',
        'Be the first to comment': 'Legyél az első hozzászóló',
        'Start the conversation — your thoughts will appear here.': 'Kezdd el a beszélgetést — a hozzászólásaid itt jelennek meg.',
        'Reply': 'Válasz',
        'Replies': 'Válaszok',
        'Like': 'Tetszik',
        'Edit': 'Szerkesztés',
        'Delete': 'Törlés',
        'Report': 'Jelentés',
        'Load more': 'Több mutatása',
        'Show replies': 'Válaszok mutatása',
        'View replies': 'Válaszok mutatása',
        'Hide replies': 'Válaszok elrejtése',
        'Cancel': 'Mégse',
        'Save': 'Mentés',
        'Powered by': 'Működteti:',
        'Pin to top': 'Rögzítés az elejére',
        'Sign out': 'Kijelentkezés',
        'Signed in as': 'Bejelentkezve:',
    };

    function forditSzoveg(node) {
        if (node.nodeType === 3) {
            var trimmed = node.textContent.trim();
            if (szovegek[trimmed]) {
                node.textContent = node.textContent.replace(trimmed, szovegek[trimmed]);
            }
        } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SVG') {
            node.childNodes.forEach(forditSzoveg);
        }
    }
    forditSzoveg(container);

    container.querySelectorAll('.et-owner-badge').forEach(function (badge) {
        badge.setAttribute('aria-label', 'Főkertész');
        badge.setAttribute('title', 'Főkertész');
        badge.childNodes.forEach(function (node) {
            if (node.nodeType === 3 && node.textContent.trim() === 'Owner') {
                var span = document.createElement('span');
                span.className = 'fcp-foot-badge';
                span.textContent = '🦶🏻';
                span.style.fontSize = '1.3em';
                span.style.textShadow = '0 1px 3px rgba(0,0,0,0.35)';
                node.parentNode.replaceChild(span, node);
            }
        });
        var foot = badge.querySelector('.fcp-foot-badge');
        var svg  = badge.querySelector('svg');
        if (foot && svg && badge.firstChild !== foot) {
            badge.insertBefore(foot, badge.firstChild);
        }
    });

    var idoMap = { 'm': 'perce', 'h': 'órája', 'd': 'napja', 'w': 'hete', 'y': 'éve' };
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var node;
    var toUpdate = [];
    while (node = walker.nextNode()) {
        if (/\d+[mhdwy] ago/.test(node.textContent)) toUpdate.push(node);
    }
    toUpdate.forEach(function (node) {
        node.textContent = node.textContent.replace(/just now/gi, 'Az imént');
        node.textContent = node.textContent.replace(/(\d+)([mhdwy]) ago/g, function (match, count, unit) {
            return count + ' ' + (idoMap[unit] || match);
        });
    });

    function etOverride() {
        var et = document.getElementById('floating-comment-body');
        if (!et) return;
        et.querySelectorAll('.et-header').forEach(function (el) { el.style.justifyContent = 'space-between'; });
        et.querySelectorAll('.et-format-hint').forEach(function (el) { el.style.display = 'none'; });
        et.querySelectorAll('.et-bell-dropdown').forEach(function (el) { el.style.transform = 'translateX(100px)'; });
        et.querySelectorAll('.et-footer').forEach(function (el) { el.style.display = 'none'; });
    }
    etOverride();

    container.querySelectorAll('.et-avatar-guest').forEach(function (el) {
        if (el.dataset.fcpGuestDone) return;
        el.dataset.fcpGuestDone = '1';
        var img = document.createElement('img');
        img.src = 'https://i.imgur.com/8DJZiU3.png';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.style.cssText = el.style.cssText;
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        el.parentNode.replaceChild(img, el);
    });

    container.querySelectorAll('.et-avatar-clickable[data-profile-user-id=""]').forEach(function (el) {
        if (el.dataset.fcpGuestDone) return;
        el.dataset.fcpGuestDone = '1';
        var size = el.style.width || '36px';
        var img = document.createElement('img');
        img.src = 'https://i.imgur.com/8DJZiU3.png';
        img.alt = '';
        img.style.width = size;
        img.style.height = size;
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.display = 'inline-block';
        img.style.flexShrink = '0';
        el.parentNode.replaceChild(img, el);
    });

    container.querySelectorAll('.et-view-replies-btn').forEach(function (btn) {
        btn.textContent = btn.textContent
            .replace(/View (\d+) replies/i, '$1 válasz mutatása')
            .replace(/View (\d+) reply/i, '$1 válasz mutatása');
    });

    var walker2 = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var node2;
    var toUpdate2 = [];
    while (node2 = walker2.nextNode()) {
        var t2 = node2.textContent;
        if (/Replying to/i.test(t2) || /\d+ Comments?/i.test(t2)) toUpdate2.push(node2);
    }
    toUpdate2.forEach(function (node2) {
        node2.textContent = node2.textContent
            .replace(/Replying to/gi, 'Válasz erre:')
            .replace(/(\d+) Comments/gi, '$1 hozzászólás')
            .replace(/(\d+) Comment/gi, '$1 hozzászólás');
    });

    var signinBand = container.querySelector('.et-compose-signin-band');
    if (signinBand) signinBand.style.marginLeft = '0';

    var signinRow = container.querySelector('.et-signin-band-row');
    if (signinRow) {
        signinRow.style.justifyContent = 'center';
        if (!signinRow.dataset.fcpReordered) {
            signinRow.dataset.fcpReordered = '1';
            var google   = signinRow.querySelector('[data-et-provider="google"]');
            var facebook = signinRow.querySelector('[data-et-provider="facebook"]');
            var x        = signinRow.querySelector('[data-et-provider="twitter"]');
            [google, facebook, x].forEach(function (btn) {
                if (!btn) return;
                var textSpan = btn.querySelector('.et-signin-band-text');
                if (textSpan) textSpan.style.display = 'none';
                signinRow.appendChild(btn);
            });
        }
    }
}


/* ── Belső: nyit/csuk ── */
function _toggleFloatingPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (!drawer) return;
    if (drawer.classList.contains('is-open')) {
        _closeFloatingPanel();
    } else {
        drawer.classList.add('is-open');
    }
}

function _closeFloatingPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
}


/* ── Panel frissítése (SPA-navigáció) ── */
function updateFloatingCommentPanel(postPageUrl, postIdentifier, titleText, url) {
    var echoDiv = document.querySelector('#floating-comment-body #echothread');
    if (!echoDiv) return;

    echoDiv.setAttribute('data-page-url', postPageUrl || url);
    echoDiv.setAttribute('data-page-title', titleText || document.title);
    if (postIdentifier) {
        echoDiv.setAttribute('data-identifier', postIdentifier);
    } else {
        echoDiv.removeAttribute('data-identifier');
    }

    if (window.EchoThread && window.EchoThread.bootstrap) {
        window.EchoThread.bootstrap();
    } else {
        var s = document.createElement('script');
        s.src = 'https://cdn.echothread.io/widget.js';
        s.async = true;
        document.body.appendChild(s);
    }

    setTimeout(function () {
        syncEtCommentCount();
        magyaritEchoThread();
    }, 300);

    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) drawer.classList.add('is-visible');
}


/* ── Panel elrejtése ── */
function hideFloatingCommentPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) drawer.classList.remove('is-open', 'is-visible');
    var countDisplay = document.getElementById('comment-count-display');
    if (countDisplay) countDisplay.textContent = '(0)';
    var header = document.getElementById('my-custom-comment-count');
    if (header) header.textContent = '';
}
