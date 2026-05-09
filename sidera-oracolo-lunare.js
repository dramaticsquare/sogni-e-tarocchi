// ══════════════════════════════════════════════════════════════════════════
//  SIDERA — Guida Lunare Personalizzata
//  Aggiungi <script src="sidera-oracolo-lunare.js"></script> prima di </body>
// ══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Iniezione CSS e HTML ────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {

        // ── Stili ───────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            #lunarDeepDiveBtn {
                display: none;
                max-width: 720px;
                margin: 20px auto 0;
                padding: 0 0 4px;
                animation: fadeUp 0.5s ease;
            }
            #lunarDeepDiveBtn textarea {
                width: 100%;
                background: rgba(7,5,15,0.65);
                border: 1px solid rgba(201,168,76,0.18);
                border-radius: 12px;
                color: var(--text);
                padding: 13px 16px;
                font-family: 'Cormorant Garamond', serif;
                font-size: 16px;
                font-style: italic;
                outline: none;
                resize: none;
                transition: border-color 0.3s;
                margin-bottom: 12px;
                display: block;
            }
            #lunarDeepDiveBtn textarea:focus {
                border-color: rgba(201,168,76,0.45);
            }
            #lunarDeepDiveBtn textarea::placeholder {
                color: rgba(138,122,94,0.45);
            }
            .btn-guida-lunare {
                width: 100%;
                padding: 18px;
                border-radius: 14px;
                cursor: pointer;
                transition: all 0.4s;
                border: 1px solid rgba(201,168,76,0.65);
                background: linear-gradient(135deg, rgba(42,26,85,0.92), rgba(107,63,160,0.75));
                color: var(--gold-pale);
                font-family: 'Cinzel', serif;
                font-size: 11px;
                letter-spacing: 0.22em;
                text-transform: uppercase;
                display: block;
                position: relative;
                overflow: hidden;
            }
            .btn-guida-lunare::after {
                content: '';
                position: absolute; top: 0; left: -100%;
                width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                transition: left 0.5s;
            }
            .btn-guida-lunare:hover::after { left: 100%; }
            .btn-guida-lunare:hover {
                background: linear-gradient(135deg, rgba(107,63,160,0.92), rgba(42,26,85,1));
                box-shadow: 0 8px 30px rgba(201,168,76,0.22);
                transform: translateY(-1px);
            }

            /* Pannello risultato */
            #lunarDeepDiveResult {
                display: none;
                max-width: 720px;
                margin: 28px auto 0;
                animation: fadeUp 0.6s ease;
            }
            .lddr-panel {
                border: 1px solid var(--border);
                border-radius: 20px;
                overflow: hidden;
                background: rgba(20,14,40,0.55);
                backdrop-filter: blur(12px);
            }
            .lddr-header {
                padding: 18px 26px;
                background: rgba(42,26,85,0.3);
                border-bottom: 1px solid var(--border);
                display: flex; align-items: center;
                justify-content: space-between; gap: 10px; flex-wrap: wrap;
            }
            .lddr-header h3 {
                font-family: 'Cinzel', serif; font-size: 0.82rem;
                color: var(--gold-light); letter-spacing: 2px;
                text-transform: uppercase; margin: 0;
            }
            .lddr-header p {
                font-family: 'Cinzel', serif; font-size: 9px;
                color: var(--text-muted); letter-spacing: 1px; margin: 2px 0 0;
            }
            .lddr-body { padding: 30px 28px; }
            .lddr-footer {
                padding: 16px 26px; border-top: 1px solid var(--border);
                display: flex; gap: 8px; flex-wrap: wrap;
                align-items: center; justify-content: center;
            }
            .lddr-cached {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 3px 12px; border-radius: 50px;
                background: rgba(80,160,80,0.1);
                border: 1px solid rgba(80,160,80,0.3);
                font-family: 'Cinzel', serif; font-size: 8px;
                color: #90c870; letter-spacing: 2px; text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);

        // ── Pulsante CTA (fuori da #lunarInfluenceBox) ──────────────────
        const infBox = document.getElementById('lunarInfluenceBox');
        if (infBox) {
            const btnDiv = document.createElement('div');
            btnDiv.id = 'lunarDeepDiveBtn';
            btnDiv.innerHTML = `
                <label style="display:block; font-family:'Cinzel',serif; font-size:9px;
                    color:var(--text-muted); letter-spacing:2px; text-transform:uppercase;
                    margin-bottom:8px;">
                    ✦ Il tuo intento per oggi &nbsp;
                    <span style="color:rgba(138,122,94,0.5); font-size:8px; letter-spacing:1px;">
                        — opzionale
                    </span>
                </label>
                <textarea id="lunarIntentoInput" rows="2"
                    placeholder="Cosa vuoi mettere a fuoco oggi? Un'intenzione, una domanda, un'emozione…">
                </textarea>
                <button class="btn-guida-lunare" onclick="window.sideraLunar.run()">
                    ☽ Svela la tua Guida Lunare — 2 Crediti
                </button>
                <span style="font-family:'Cinzel',serif; font-size:9px; color:rgba(138,122,94,0.48);
                    letter-spacing:1px; text-align:center; margin-top:8px; display:block;">
                    lettura personalizzata · valida per tutta la giornata
                </span>
            `;
            // Inserisci DOPO infBox (non dentro)
            infBox.parentNode.insertBefore(btnDiv, infBox.nextSibling);
        }

        // ── Pannello risultato (dopo il pulsante CTA) ───────────────────
        const btnDiv = document.getElementById('lunarDeepDiveBtn');
        if (btnDiv) {
            const resultDiv = document.createElement('div');
            resultDiv.id = 'lunarDeepDiveResult';
            resultDiv.innerHTML = `
                <div class="lddr-panel">
                    <div class="lddr-header">
                        <div>
                            <h3>☽ Guida Lunare del Giorno</h3>
                            <p id="lunarDeepDiveMeta">—</p>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                            <span id="lunarCachedBadge" class="lddr-cached" style="display:none;">
                                ✦ già generata oggi
                            </span>
                            <button class="btn-share" onclick="window.sideraLunar.shareResult()" style="font-size:0.72rem;">✨ Condividi</button>
                            <button class="btn-share" onclick="window.sideraLunar.copyResult()" style="font-size:0.72rem;">Copia</button>
                            <button class="btn-share" onclick="document.getElementById('lunarDeepDiveResult').style.display='none'" style="font-size:0.72rem;">✕</button>
                        </div>
                    </div>
                    <div class="lddr-body">
                        <div id="lunarDeepDiveContent"></div>
                    </div>
                    <div class="lddr-footer">
                        <button class="btn-share" onclick="window.sideraLunar.run(true)" style="font-size:0.76rem;">
                            ☽ Nuova lettura — 2 Crediti
                        </button>
                    </div>
                </div>
            `;
            btnDiv.parentNode.insertBefore(resultDiv, btnDiv.nextSibling);
        }

        // ── Mostra/nascondi il pulsante in base all'auth ────────────────
        // Controlla ogni 600ms finché non è stabile, poi ogni 3s
        let _stable = 0;
        const _vis = setInterval(() => {
            updateBtnVisibility();
            _stable++;
            if (_stable > 20) clearInterval(_vis);
        }, 600);

        // ── Monkey-patch: aggiorna visibilità dopo ogni render ──────────
        const _orig = window.renderLunarSection;
        if (typeof _orig === 'function') {
            window.renderLunarSection = function () {
                _orig.apply(this, arguments);
                setTimeout(updateBtnVisibility, 120);
            };
        }
    });

    // ── Mostra il pulsante solo se utente loggato + panel visibile ──────
    function updateBtnVisibility() {
        const btn    = document.getElementById('lunarDeepDiveBtn');
        const infBox = document.getElementById('lunarInfluenceBox');
        if (!btn || !infBox) return;
        const show = !!window.currentUser && infBox.style.display !== 'none';
        btn.style.display = show ? 'block' : 'none';
    }

    // ── Namespace pubblico ───────────────────────────────────────────────
    window.sideraLunar = {

        run: async function (forceNew) {
            const cu       = window.currentUser;
            const moonSign = window.getCurrentMoonSign?.();
            const phase    = window.getMoonPhase?.();
            const moonData = window.MOON_SIGN_DATA?.[moonSign] || {};
            const viewSign = window._lunarViewSign || cu?.sign || '';
            const today    = new Date().toISOString().split('T')[0];
            const intento  = document.getElementById('lunarIntentoInput')?.value?.trim() || '';
            const COST     = 2;

            const resultArea = document.getElementById('lunarDeepDiveResult');
            const content    = document.getElementById('lunarDeepDiveContent');
            const metaEl     = document.getElementById('lunarDeepDiveMeta');
            const badge      = document.getElementById('lunarCachedBadge');

            // Mostra il pannello e scrolla
            resultArea.style.display = 'block';
            setTimeout(() => resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

            // Cache giornaliera
            const cacheKey = `sidera_oracolo_lunare_${today}_${viewSign||'gen'}${intento ? '_'+btoa(encodeURIComponent(intento)).slice(0,6) : ''}`;
            const cached   = !forceNew && localStorage.getItem(cacheKey);

            if (metaEl) metaEl.innerText = `${phase?.name||''} · Luna in ${moonSign}${viewSign ? ' · ' + viewSign : ''}`;

            if (cached) {
                content.innerHTML = window.formatText ? window.formatText(cached) : cached;
                if (badge) badge.style.display = 'inline-flex';
                window.showToast?.('✦ Lettura già generata oggi — nessun credito scalato.');
                return;
            }

            if (badge) badge.style.display = 'none';

            // Controlla crediti
            const c = parseInt(localStorage.getItem('astral_credits')) || 0;
            if (c < COST) { resultArea.style.display = 'none'; window.openPayment?.(); return; }

            content.innerHTML = '<p class="loading-text">La luna sta componendo il tuo messaggio</p>';

            try {
                const res = await fetch(window.MAKE_URL, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipo:          'oracolo_lunare',
                        data:           today,
                        fase_lunare:    phase?.name  || '',
                        luna_in:        moonSign     || '',
                        segno_utente:   viewSign,
                        nome:           cu?.name     || '',
                        energia:        moonData.energy || '',
                        intento:        intento,
                        personalizzato: !!viewSign,
                    })
                });

                const text = await res.text();
                content.innerHTML = window.formatText ? window.formatText(text) : text;

                // Salva in cache e pulisci giorni vecchi
                localStorage.setItem(cacheKey, text);
                Object.keys(localStorage)
                    .filter(k => k.startsWith('sidera_oracolo_lunare_') && k !== cacheKey)
                    .forEach(k => localStorage.removeItem(k));

                window.saveToHistory?.('oracolo_lunare',
                    `${phase?.name||''} · Luna in ${moonSign}${viewSign ? ' · ' + viewSign : ''}${intento ? ' | ' + intento.slice(0,60) : ''}`,
                    text
                );
                window.deductCredits?.(COST);

            } catch (e) {
                console.error('[Sidera] Oracolo Lunare:', e);
                content.innerHTML = `<p style="color:var(--text-muted);font-style:italic;text-align:center;padding:12px 0;">
                    La luna non ha risposto. I crediti non sono stati scalati — riprova tra poco.
                </p>`;
            }
        },

        shareResult: async function () {
            const text  = document.getElementById('lunarDeepDiveContent')?.innerText || '';
            const phase = window.getMoonPhase?.() || {};
            const moon  = window.getCurrentMoonSign?.() || '';
            const sign  = window._lunarViewSign || window.currentUser?.sign || '';
            const sym   = (window.ZODIAC_SYMBOLS?.[sign]) || '✦';
            const share = `✦ Guida Lunare del Giorno · Sidera ✦\n\n${phase.sym||'☽'} ${phase.name||''} · Luna in ${moon}${sign ? '\n' + sym + ' ' + sign : ''}\n\n${text.slice(0,400)}…\n\nhttps://sidera7.vercel.app/`;
            if (navigator.share) {
                try { await navigator.share({ title: 'Sidera — Guida Lunare', text: share }); return; }
                catch (e) { if (e.name === 'AbortError') return; }
            }
            try { await navigator.clipboard.writeText(share); window.showToast?.('✨ Testo copiato!'); }
            catch { window.showToast?.('Copia il testo manualmente.'); }
        },

        copyResult: async function () {
            try {
                await navigator.clipboard.writeText(document.getElementById('lunarDeepDiveContent')?.innerText || '');
                window.showToast?.('Testo copiato negli appunti.');
            } catch { window.showToast?.('Copia il testo manualmente.'); }
        }
    };

    // Alias diretto
    window.runLunarDeepDive = () => window.sideraLunar.run();

})();
