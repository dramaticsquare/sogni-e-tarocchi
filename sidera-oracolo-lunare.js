// ══════════════════════════════════════════════════════════════════════════
//  SIDERA — Guida Lunare Personalizzata (Oracolo Lunare)
//  Aggiunge la funzione runLunarDeepDive() e il pannello risultato.
//  Come usare: aggiungi <script src="sidera-oracolo-lunare.js"></script>
//  subito prima di </body> in index.html
// ══════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ── Iniezione HTML: pannello risultato e CSS aggiuntivo ─────────────────
    document.addEventListener('DOMContentLoaded', () => {

        // CSS per il nuovo pannello
        const style = document.createElement('style');
        style.textContent = `
            #lunarDeepDiveResult {
                display: none;
                max-width: 720px;
                margin: 28px auto 0;
                animation: fadeUp 0.6s ease;
            }
            .lunar-deepdive-panel {
                border: 1px solid var(--border);
                border-radius: 20px;
                overflow: hidden;
                background: rgba(20,14,40,0.5);
                backdrop-filter: blur(12px);
            }
            .lunar-deepdive-header {
                padding: 18px 26px;
                background: rgba(42,26,85,0.3);
                border-bottom: 1px solid var(--border);
                display: flex; align-items: center;
                justify-content: space-between; gap: 10px;
                flex-wrap: wrap;
            }
            .lunar-deepdive-header-left { display: flex; align-items: center; gap: 12px; }
            .lunar-deepdive-header-icon { font-size: 1.4rem; }
            .lunar-deepdive-header h3 {
                font-family: 'Cinzel', serif; font-size: 0.82rem;
                color: var(--gold-light); letter-spacing: 2px;
                text-transform: uppercase; margin: 0;
            }
            .lunar-deepdive-header p {
                font-family: 'Cinzel', serif; font-size: 9px;
                color: var(--text-muted); letter-spacing: 1px; margin: 2px 0 0;
            }
            .lunar-deepdive-body { padding: 30px 28px; }
            .lunar-deepdive-footer {
                padding: 16px 26px; border-top: 1px solid var(--border);
                display: flex; gap: 8px; flex-wrap: wrap;
                align-items: center; justify-content: center;
            }

            /* Intento personale — input sottile */
            .lunar-intento-wrap {
                margin-top: 14px; margin-bottom: 0;
            }
            .lunar-intento-label {
                display: block; font-family: 'Cinzel', serif; font-size: 9px;
                color: var(--text-muted); letter-spacing: 2px;
                text-transform: uppercase; margin-bottom: 6px;
            }
            .lunar-intento-label span {
                color: rgba(138,122,94,0.5);
                font-size: 8px; letter-spacing: 1px;
            }
            #lunarIntentoInput {
                width: 100%; background: rgba(7,5,15,0.6);
                border: 1px solid rgba(201,168,76,0.15);
                border-radius: 10px; color: var(--text);
                padding: 12px 16px; font-family: 'Cormorant Garamond', serif;
                font-size: 16px; font-style: italic; outline: none;
                resize: none; transition: border-color 0.3s;
                line-height: 1.5;
            }
            #lunarIntentoInput:focus {
                border-color: rgba(201,168,76,0.4);
                box-shadow: 0 0 0 3px rgba(201,168,76,0.05);
            }
            #lunarIntentoInput::placeholder { color: rgba(138,122,94,0.45); }

            /* Pulsante principale */
            .btn-lunar-deepdive {
                width: 100%; margin-top: 14px; padding: 18px;
                border-radius: 14px; cursor: pointer; transition: 0.4s;
                border: 1px solid rgba(201,168,76,0.6);
                background: linear-gradient(135deg, rgba(42,26,85,0.9), rgba(107,63,160,0.7));
                color: var(--gold-pale);
                font-family: 'Cinzel', serif; font-size: 11px;
                letter-spacing: 0.2em; text-transform: uppercase;
                position: relative; overflow: hidden;
            }
            .btn-lunar-deepdive::after {
                content: ''; position: absolute; top: 0; left: -100%;
                width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                transition: left 0.5s;
            }
            .btn-lunar-deepdive:hover::after { left: 100%; }
            .btn-lunar-deepdive:hover {
                background: linear-gradient(135deg, rgba(107,63,160,0.9), rgba(42,26,85,1));
                box-shadow: 0 8px 30px rgba(201,168,76,0.2);
                transform: translateY(-1px);
            }
            .btn-lunar-deepdive:disabled {
                opacity: 0.5; cursor: not-allowed; transform: none;
            }
            .lunar-cost-note {
                font-family: 'Cinzel', serif; font-size: 9px;
                color: rgba(138,122,94,0.5); letter-spacing: 1px;
                text-align: center; margin-top: 8px; display: block;
            }
            /* Cached badge */
            .lunar-cached-badge {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 4px 14px; border-radius: 50px;
                background: rgba(80,160,80,0.1);
                border: 1px solid rgba(80,160,80,0.3);
                font-family: 'Cinzel', serif; font-size: 8px;
                color: #90c870; letter-spacing: 2px; text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);

        // ── Pannello risultato (iniettato dopo #lunarSection) ─────────────
        const lunarSection = document.getElementById('lunarSection');
        if (!lunarSection) return;

        const resultDiv = document.createElement('div');
        resultDiv.id = 'lunarDeepDiveResult';
        resultDiv.innerHTML = `
            <div class="lunar-deepdive-panel">
                <div class="lunar-deepdive-header">
                    <div class="lunar-deepdive-header-left">
                        <span class="lunar-deepdive-header-icon">☽</span>
                        <div>
                            <h3>Guida Lunare del Giorno</h3>
                            <p id="lunarDeepDiveMeta">— · —</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                        <span id="lunarCachedBadge" class="lunar-cached-badge" style="display:none;">
                            ✦ già generata oggi
                        </span>
                        <button class="btn-share" onclick="window.sideraLunar.shareDeepDive()" style="font-size:0.72rem;">✨ Condividi</button>
                        <button class="btn-share" onclick="window.sideraLunar.copyDeepDive()" style="font-size:0.72rem;">Copia</button>
                        <button class="btn-share" onclick="document.getElementById('lunarDeepDiveResult').style.display='none'; document.getElementById('lunarDeepDiveResult').scrollIntoView({block:'end'});" style="font-size:0.72rem;">✕ Chiudi</button>
                    </div>
                </div>
                <div class="lunar-deepdive-body">
                    <div id="lunarDeepDiveContent"></div>
                </div>
                <div class="lunar-deepdive-footer">
                    <button class="btn-share" onclick="window.sideraLunar.runAgain()" style="font-size:0.76rem;">
                        ☽ Genera nuova lettura — 2 Crediti
                    </button>
                </div>
            </div>
        `;
        lunarSection.parentNode.insertBefore(resultDiv, lunarSection.nextSibling);

        // ── 1. Monkey-patch renderLunarSection (metodo più affidabile) ────
        // La funzione è già definita nell'index.html — la avvolgiamo
        // così ogni chiamata (anche future: cambio segno, login, ecc.)
        // inietta automaticamente il pulsante alla fine.
        const _origRender = window.renderLunarSection;
        if (typeof _origRender === 'function') {
            window.renderLunarSection = function () {
                _origRender.apply(this, arguments);
                // Piccolo delay: lascia che il DOM si stabilizzi
                setTimeout(injectDeepDiveButton, 80);
            };
        }

        // ── 2. MutationObserver come backup ──────────────────────────
        const infBox = document.getElementById('lunarInfluenceBox');
        if (infBox) {
            const observer = new MutationObserver(() => {
                setTimeout(injectDeepDiveButton, 80);
            });
            observer.observe(infBox, { childList: true, subtree: false });
        }

        // ── 3. Retry polling (cattura render già avvenute + login lento)
        // Si ferma non appena il pulsante appare, max 15 tentativi
        let _attempts = 0;
        const _poller = setInterval(() => {
            _attempts++;
            injectDeepDiveButton();
            const btn = document.querySelector('.btn-lunar-deepdive');
            if (btn || _attempts >= 15) clearInterval(_poller);
        }, 800);
    });

    // ── Iniezione pulsante CTA nel pannello influenza ────────────────────
    function injectDeepDiveButton() {
        // Solo per utenti loggati con infBox visibile e popolato
        if (!window.currentUser) return;
        const infBox = document.getElementById('lunarInfluenceBox');
        if (!infBox || infBox.style.display === 'none') return;
        if (!infBox.children.length) return;             // ancora vuoto
        if (infBox.querySelector('.btn-lunar-deepdive')) return; // già iniettato

        const wrap = document.createElement('div');
        wrap.className = 'lunar-intento-wrap';
        wrap.innerHTML = `
            <label class="lunar-intento-label">
                ✦ Il tuo intento per oggi
                <span>— opzionale, personalizza ulteriormente la lettura</span>
            </label>
            <textarea id="lunarIntentoInput" rows="2"
                placeholder="Cosa vuoi mettere a fuoco oggi? Un'intenzione, una decisione, un'emozione…"></textarea>

            <button class="btn-lunar-deepdive" onclick="window.sideraLunar.run()">
                ☽ Guida Lunare Personalizzata — 2 Crediti
            </button>
            <span class="lunar-cost-note">
                L'oracolo interpreta la luna nel tuo segno · valida per tutta la giornata
            </span>
        `;

        // Inserisci prima dell'ultimo div (quello con i pulsanti condivisione)
        const lastDiv = infBox.querySelector('div:last-child');
        if (lastDiv) {
            infBox.insertBefore(wrap, lastDiv);
        } else {
            infBox.appendChild(wrap);
        }
    }

    // ── Namespace pubblico ───────────────────────────────────────────────
    window.sideraLunar = {

        // ── Funzione principale ──────────────────────────────────────────
        run: async function (forceNew = false) {
            const cu        = window.currentUser;
            const moonSign  = window.getCurrentMoonSign();
            const phase     = window.getMoonPhase();
            const moonData  = window.MOON_SIGN_DATA?.[moonSign] || {};
            const viewSign  = window._lunarViewSign || cu?.sign || '';
            const today     = new Date().toISOString().split('T')[0];
            const intento   = document.getElementById('lunarIntentoInput')?.value?.trim() || '';
            const COST      = 2;

            // Mostra subito il pannello
            const resultArea    = document.getElementById('lunarDeepDiveResult');
            const resultContent = document.getElementById('lunarDeepDiveContent');
            const metaEl        = document.getElementById('lunarDeepDiveMeta');
            const cachedBadge   = document.getElementById('lunarCachedBadge');

            resultArea.style.display = 'block';
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // ── Cache giornaliera ────────────────────────────────────────
            // Chiave: data + segno + (hash intento se presente)
            const intentoHash = intento ? '_' + btoa(encodeURIComponent(intento)).slice(0, 8) : '';
            const cacheKey    = `sidera_oracolo_lunare_${today}_${viewSign || 'gen'}${intentoHash}`;
            const cached      = !forceNew && localStorage.getItem(cacheKey);

            if (metaEl) {
                metaEl.innerText = `${phase.name} · Luna in ${moonSign}${viewSign ? ' · ' + viewSign : ''}`;
            }

            if (cached) {
                resultContent.innerHTML = window.formatText ? window.formatText(cached) : cached;
                if (cachedBadge) cachedBadge.style.display = 'inline-flex';
                window.showToast?.('✦ Lettura del giorno già generata — nessun credito scalato.');
                return;
            }

            if (cachedBadge) cachedBadge.style.display = 'none';

            // ── Controllo crediti ────────────────────────────────────────
            const c = parseInt(localStorage.getItem('astral_credits')) || 0;
            if (c < COST) {
                resultArea.style.display = 'none';
                window.openPayment?.();
                return;
            }

            // ── Loading ──────────────────────────────────────────────────
            resultContent.innerHTML = '<p class="loading-text">La luna sta componendo il tuo messaggio</p>';

            try {
                // Il payload usa i nomi esatti che il prompt Make.com si aspetta
                const payload = {
                    tipo:         'oracolo_lunare',          // filtro Router Make
                    data:          today,
                    fase_lunare:   phase.name,               // {{1.fase_lunare}}
                    luna_in:       moonSign,                 // {{1.luna_in}}
                    segno_utente:  viewSign,                 // {{1.segno_utente}}
                    nome:          cu?.name || '',           // {{1.nome}}
                    energia:       moonData.energy || '',    // {{1.energia}}
                    intento:       intento,                  // {{1.intento}}
                    personalizzato: !!viewSign
                };

                const response = await fetch(window.MAKE_URL, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload)
                });

                const text = await response.text();
                resultContent.innerHTML = window.formatText ? window.formatText(text) : text;

                // ── Salva in cache ───────────────────────────────────────
                localStorage.setItem(cacheKey, text);
                // Pulisci cache giorni precedenti (stessa prefix)
                Object.keys(localStorage)
                    .filter(k => k.startsWith('sidera_oracolo_lunare_') && k !== cacheKey)
                    .forEach(k => localStorage.removeItem(k));

                window.saveToHistory?.('oracolo_lunare',
                    `${phase.name} · Luna in ${moonSign}${viewSign ? ' · ' + viewSign : ''}${intento ? ' | ' + intento.slice(0,60) : ''}`,
                    text
                );

                window.deductCredits?.(COST);

            } catch (e) {
                console.error('[Sidera] Oracolo Lunare error:', e);
                resultContent.innerHTML = `
                    <p style="color:var(--text-muted); font-style:italic; text-align:center; padding:12px 0;">
                        La luna non ha risposto in questo momento.<br>
                        I crediti non sono stati scalati — riprova tra poco.
                    </p>`;
            }
        },

        // ── Rigenera forzando nuova chiamata API ─────────────────────────
        runAgain: function () {
            const cachedBadge = document.getElementById('lunarCachedBadge');
            if (cachedBadge) cachedBadge.style.display = 'none';
            window.sideraLunar.run(true);
        },

        // ── Condivisione nativa ──────────────────────────────────────────
        shareDeepDive: async function () {
            const content = document.getElementById('lunarDeepDiveContent')?.innerText || '';
            const phase   = window.getMoonPhase?.() || {};
            const moon    = window.getCurrentMoonSign?.() || '';
            const sign    = window._lunarViewSign || window.currentUser?.sign || '';
            const sym     = (window.ZODIAC_SYMBOLS && sign) ? window.ZODIAC_SYMBOLS[sign] : '✦';

            const text = `✦ Guida Lunare del Giorno · Sidera ✦\n\n`
                + `${phase.sym || '☽'} ${phase.name || ''} · Luna in ${moon}${sign ? '\n' + sym + ' ' + sign : ''}\n\n`
                + content.slice(0, 400)
                + '…\n\nScopri la tua guida lunare → https://sidera7.vercel.app/';

            if (navigator.share) {
                try { await navigator.share({ title: 'Sidera — Guida Lunare', text }); return; }
                catch (e) { if (e.name === 'AbortError') return; }
            }
            try {
                await navigator.clipboard.writeText(text);
                window.showToast?.('✨ Testo copiato — incollalo dove vuoi!');
            } catch { window.showToast?.('Copia il testo manualmente.'); }
        },

        // ── Copia testo ──────────────────────────────────────────────────
        copyDeepDive: async function () {
            const content = document.getElementById('lunarDeepDiveContent')?.innerText || '';
            try {
                await navigator.clipboard.writeText(content);
                window.showToast?.('Testo copiato negli appunti.');
            } catch { window.showToast?.('Copia il testo manualmente.'); }
        }
    };

    // Alias globale per retrocompatibilità (es. onclick="runLunarDeepDive()")
    window.runLunarDeepDive = () => window.sideraLunar.run();

})();
