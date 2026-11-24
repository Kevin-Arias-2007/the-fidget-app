   lucide.createIcons();

        const tabTitles = {
            'dashboard': 'Inicio',
            'favorites': 'Favoritos',
            'all': 'Todos los Fidgets',
            'calm-games': 'Calm Games',
            'checkin': 'Check-in emocional',
            'grounding': 'Anclaje 5-4-3-2-1',
            'history': 'Historial',
            'emergency-contacts': 'Contactos de emergencia',
            'articles': 'Artículos',
            'focus': 'Focus Mode',
            'music': 'Músicas',
            'breathe': 'Breathe',
            'settings': 'Ajustes'
        };

        function hideMainViews() {
            ['view-welcome', 'view-login', 'view-app', 'view-spinner', 'view-popit', 'view-ondas', 'view-cube', 'view-sos', 'view-geo', 'view-draw', 'view-slime'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
        }

        function showWelcomeView() {
            hideMainViews();
            document.getElementById('view-welcome').classList.remove('hidden');
        }

        function showLoginView(mode = 'login') {
            hideMainViews();
            document.getElementById('view-login').classList.remove('hidden');
            switchAuthMode(mode);
        }

        function showAppTab(tabKey) {
            hideMainViews();
            document.getElementById('view-app').classList.remove('hidden');

            document.querySelectorAll('.app-tab').forEach(el => el.classList.add('hidden'));
            const target = document.getElementById('tab-' + tabKey);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.sidebar .menu-item').forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-tab') === tabKey);
            });

            const userBtn = document.getElementById('sidebar-user-btn');
            if (userBtn) userBtn.classList.toggle('active', tabKey === 'settings');

            document.getElementById('topbar-title-text').textContent = tabTitles[tabKey] || 'Inicio';
            document.getElementById('app-content-scroll').scrollTop = 0;

            if (tabKey === 'history') renderHistoryEntries();
            if (tabKey === 'summary') updateSummaryMetrics();
        }

        /* CHECK-IN, HISTORIAL Y RESUMEN */
        let selectedMoodData = null;

        const moodSvgs = {
            'ci-mood-1': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 15 Q 12 11 17 15" /></svg>',
            'ci-mood-2': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 14.5 Q 12 12 16 14.5" /></svg>',
            'ci-mood-3': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 13 L 17 13" /></svg>',
            'ci-mood-4': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 12.5 Q 12 15.5 16 12.5" /></svg>',
            'ci-mood-5': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 12 Q 12 16.5 17 12" /></svg>'
        };

        let historyEntries = [
            {
                id: 1,
                mood: 'Bien',
                moodClass: 'ci-mood-4',
                note: 'Me ayudó tomar una pausa.',
                date: '16 nov. 2026, 10:13',
                month: 'nov'
            }
        ];

        function selectCheckinMood(cardEl) {
            document.querySelectorAll('.checkin-mood-card').forEach(el => el.classList.remove('selected'));
            cardEl.classList.add('selected');
            selectedMoodData = {
                mood: cardEl.getAttribute('data-mood'),
                moodClass: cardEl.getAttribute('data-class')
            };
            document.getElementById('btn-save-checkin').classList.add('ready');
        }

        function updateCheckinCount() {
            const textarea = document.getElementById('checkin-note-input');
            document.getElementById('checkin-char-count').textContent = `${textarea.value.length}/240`;
        }

        function updateSummaryMetrics() {
            const totalEl = document.getElementById('summary-total-count');
            const streakEl = document.getElementById('summary-streak-count');
            const avgEl = document.getElementById('summary-avg-mood');
            if (!totalEl && !streakEl && !avgEl) return;

            if (totalEl) totalEl.textContent = historyEntries.length;
            if (streakEl) streakEl.textContent = historyEntries.length > 0 ? `${Math.min(historyEntries.length, 7)} días` : '0 días';
            if (avgEl) avgEl.textContent = historyEntries.length > 0 ? historyEntries[0].mood : 'Sin datos';
        }

        function saveCheckinEntry() {
            if (!selectedMoodData) return;

            const textarea = document.getElementById('checkin-note-input');
            const noteText = textarea.value.trim() || 'Sin nota adicional.';
            const now = new Date();
            const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${hh}:${mm}`;

            historyEntries.unshift({
                id: Date.now(),
                mood: selectedMoodData.mood,
                moodClass: selectedMoodData.moodClass,
                note: noteText,
                date: formattedDate,
                month: 'nov'
            });

            document.querySelectorAll('.checkin-mood-card').forEach(el => el.classList.remove('selected'));
            selectedMoodData = null;
            textarea.value = '';
            updateCheckinCount();
            updateSummaryMetrics();
            document.getElementById('btn-save-checkin').classList.remove('ready');

            showAppTab('history');
        }

        function deleteHistoryEntry(id) {
            if (!confirm('¿Deseas eliminar este registro emocional de tu historial?')) return;
            historyEntries = historyEntries.filter(item => item.id !== id);
            saveStateToStorage();
            renderHistoryEntries();
            if (typeof syncQuickCheckinCard === 'function') syncQuickCheckinCard();
            showToast('Registro eliminado');
        }

        function renderHistoryEntries() {
            const container = document.getElementById('history-list');
            const filter = document.getElementById('history-month-filter').value;
            const filtered = filter === 'all' ? historyEntries : historyEntries.filter(e => e.month === filter);

            if (filtered.length === 0) {
                container.innerHTML = '<div class="history-empty">No hay registros emocionales en este periodo.</div>';
                return;
            }

            container.innerHTML = filtered.map(entry => `
                <div class="history-item">
                    <div class="history-item-left">
                        <div class="ci-circle ${entry.moodClass}">${moodSvgs[entry.moodClass] || moodSvgs['ci-mood-4']}</div>
                        <div class="history-item-info">
                            <h4>${entry.mood}</h4>
                            <p>${entry.note}</p>
                        </div>
                    </div>
                    <div class="history-item-right">
                        <span class="history-date">${entry.date}</span>
                        <button type="button" class="btn-delete-entry" onclick="deleteHistoryEntry(${entry.id})">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }

        renderHistoryEntries();
        updateSummaryMetrics();
        /* CONTACTOS Y NÚMEROS DE EMERGENCIA */
        let personalContact = {
            name: 'Diego Huamán',
            phone: '+51 987 654 321',
            relation: 'Persona de confianza · Disponible para llamadas'
        };

        const peruEmergencyLines = [
            {
                number: '113',
                extra: 'Opción 5',
                name: 'Línea 113 – Salud Mental (MINSA)',
                category: 'Salud mental',
                badgeClass: 'salud',
                desc: 'Orientación psicológica gratuita, contención en crisis y acompañamiento emocional en todo el Perú.'
            },
            {
                number: '106',
                extra: 'SAMU',
                name: 'SAMU – Emergencias Médicas',
                category: 'Médica',
                badgeClass: 'medica',
                desc: 'Sistema de Atención Móvil de Urgencia para emergencias médicas y envío de ambulancias.'
            },
            {
                number: '105',
                extra: 'PNP',
                name: 'Policía Nacional del Perú',
                category: 'Seguridad',
                badgeClass: 'seguridad',
                desc: 'Central de emergencias policiales para situaciones de peligro inmediato o seguridad ciudadana.'
            },
            {
                number: '116',
                extra: 'CGBVP',
                name: 'Bomberos Voluntarios del Perú',
                category: 'Seguridad',
                badgeClass: 'seguridad',
                desc: 'Atención de incendios, rescates, accidentes y emergencias prehospitalarias.'
            },
            {
                number: '100',
                extra: 'MIMP',
                name: 'Línea 100 – Protección y Apoyo',
                category: 'Protección',
                badgeClass: 'proteccion',
                desc: 'Orientación, consejería y soporte emocional frente a violencia familiar o situaciones de vulnerabilidad.'
            },
            {
                number: '117',
                extra: 'EsSalud',
                name: 'STAE – Urgencias EsSalud',
                category: 'Médica',
                badgeClass: 'medica',
                desc: 'Servicio de Transporte Asistido de Emergencia para urgencias médicas.'
            }
        ];

        let currentEmergencyCategory = 'Todos';
        let toastTimer = null;

        function showToast(message) {
            const toast = document.getElementById('em-toast');
            if (!toast) return;
            toast.textContent = message;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
        }

        function copyText(text, successMsg) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => showToast(successMsg));
            } else {
                const temp = document.createElement('textarea');
                temp.value = text;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
                showToast(successMsg);
            }
        }

        function getInitials(fullName) {
            return fullName.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('') || 'PC';
        }

        function renderPersonalContact() {
            const initials = getInitials(personalContact.name);
            const cleanPhone = personalContact.phone.replace(/\s+/g, '');

            const av = document.getElementById('em-contact-avatar');
            const nm = document.getElementById('em-contact-name');
            const rel = document.getElementById('em-contact-relation');
            const ph = document.getElementById('em-contact-phone');
            const callBtn = document.getElementById('em-contact-call-btn');

            if (av) av.textContent = initials;
            if (nm) nm.textContent = personalContact.name;
            if (rel) rel.textContent = personalContact.relation;
            if (ph) ph.textContent = personalContact.phone;
            if (callBtn) callBtn.href = 'tel:' + cleanPhone;
        }

        function toggleEditContact(forceState) {
            const form = document.getElementById('em-edit-form');
            const shouldOpen = typeof forceState === 'boolean' ? forceState : form.classList.contains('hidden');
            if (shouldOpen) {
                document.getElementById('edit-contact-name').value = personalContact.name;
                document.getElementById('edit-contact-phone').value = personalContact.phone;
                document.getElementById('edit-contact-relation').value = personalContact.relation;
                form.classList.remove('hidden');
            } else {
                form.classList.add('hidden');
            }
        }

        function savePersonalContact(e) {
            e.preventDefault();
            personalContact.name = document.getElementById('edit-contact-name').value.trim() || 'Diego Huamán';
            personalContact.phone = document.getElementById('edit-contact-phone').value.trim() || '+51 987 654 321';
            personalContact.relation = document.getElementById('edit-contact-relation').value.trim() || 'Persona de confianza';
            renderPersonalContact();
            toggleEditContact(false);
            showToast('Contacto personal actualizado');
        }

        function filterEmergencyNumbers(category, btnEl) {
            currentEmergencyCategory = category;
            document.querySelectorAll('#em-filter-group .filter-tag').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            renderEmergencyDirectory();
        }

        function renderEmergencyDirectory() {
            const grid = document.getElementById('em-directory-grid');
            if (!grid) return;
            const list = currentEmergencyCategory === 'Todos'
                ? peruEmergencyLines
                : peruEmergencyLines.filter(item => item.category === currentEmergencyCategory);

            grid.innerHTML = list.map(line => `
                <div class="em-dir-card">
                    <div>
                        <div class="em-dir-top" style="margin-bottom: 14px;">
                            <span class="em-cat-badge ${line.badgeClass}">${line.category}</span>
                            <span class="em-247">24/7 · Gratuito</span>
                        </div>
                        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px;">
                            <span class="em-big-number">${line.number}</span>
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted-dark);">${line.extra}</span>
                        </div>
                        <h4 class="em-dir-name">${line.name}</h4>
                        <p class="em-dir-desc">${line.desc}</p>
                    </div>
                    <div class="em-dir-actions">
                        <a href="tel:${line.number}" class="em-btn em-btn-primary" onclick="showToast('Marcando ${line.number} (${line.extra})...')">
                            <i data-lucide="phone"></i> Llamar
                        </a>
                        <button type="button" class="em-btn" onclick="copyText('${line.number}', 'Número ${line.number} copiado')">
                            <i data-lucide="copy"></i> Copiar
                        </button>
                    </div>
                </div>
            `).join('');

            lucide.createIcons();
        }

        renderPersonalContact();
        renderEmergencyDirectory();
        /* ARTÍCULOS */
        const articlesData = {
            sobrecarga: {
                meta: 'BIENESTAR · 5 MIN',
                title: 'Cómo reconocer una sobrecarga',
                body: `
                    <p>La sobrecarga sensorial o mental no siempre llega de golpe. Muchas veces empieza con señales sutiles: irritabilidad sin motivo aparente, dificultad para leer una frase sencilla o la sensación de que las luces y los sonidos son demasiado intensos.</p>
                    <ul>
                        <li><strong>Señales físicas:</strong> tensión en mandíbula u hombros, cansancio repentino o respiración superficial.</li>
                        <li><strong>Señales mentales:</strong> bloqueos al decidir cosas simples o necesidad urgente de salir del lugar.</li>
                    </ul>
                    <p>Escuchar estas señales a tiempo te permite bajar el ritmo antes de agotarte: reducir un estímulo, tomar agua o usar un fidget suave durante dos minutos puede marcar la diferencia.</p>
                `
            },
            pausas: {
                meta: 'BIENESTAR · 4 MIN',
                title: 'Pausas que sí caben en tu día',
                body: `
                    <p>No necesitas una hora libre para regularte. Las micropausas de 60 a 180 segundos ayudan al sistema nervioso a soltar tensión acumulada entre clases, tareas o reuniones.</p>
                    <ul>
                        <li><strong>Pausa de mirada:</strong> enfoca un punto lejano por 20 segundos y relaja los párpados.</li>
                        <li><strong>Pausa táctil:</strong> gira el Spinner o presiona el Pop-it sin buscar ningún objetivo.</li>
                        <li><strong>Pausa de exhalación:</strong> inhala en 4 segundos y exhala lento en 6 segundos, tres veces seguidas.</li>
                    </ul>
                    <p>Una pausa breve hecha a tu ritmo siempre suma, sin exigirte perfección.</p>
                `
            },
            espacio: {
                meta: 'BIENESTAR · 7 MIN',
                title: 'Preparar un espacio sensorial',
                body: `
                    <p>Un espacio amable no requiere grandes cambios. Pequeños ajustes en tu entorno diario pueden disminuir la fatiga sensorial de forma notable.</p>
                    <ul>
                        <li><strong>Luz:</strong> prefiere iluminación cálida o indirecta frente a luces blancas intensas.</li>
                        <li><strong>Sonido:</strong> usa audífonos con ruido blanco, lluvia o mar para suavizar ruidos impredecibles.</li>
                        <li><strong>Textura:</strong> ten a mano un objeto de textura predecible o una manta ligera que te transmita calma.</li>
                    </ul>
                    <p>Prueba un ajuste a la vez y quédate solo con lo que realmente te haga sentir en calma.</p>
                `
            }
        };

        function toggleArticleTextOnly() {
            const isTextOnly = document.getElementById('art-text-only-toggle').checked;
            document.getElementById('art-grid').classList.toggle('text-only', isTextOnly);
        }

        function openArticle(key) {
            const art = articlesData[key];
            if (!art) return;
            document.getElementById('art-grid').style.display = 'none';
            document.getElementById('art-top-controls').style.display = 'none';
            document.getElementById('art-reader-content').innerHTML = `
                <span class="art-meta">${art.meta}</span>
                <h2>${art.title}</h2>
                ${art.body}
            `;
            document.getElementById('art-reader').classList.remove('hidden');
            document.getElementById('app-content-scroll').scrollTop = 0;
        }

        function closeArticleReader() {
            document.getElementById('art-reader').classList.add('hidden');
            document.getElementById('art-grid').style.display = 'grid';
            document.getElementById('art-top-controls').style.display = 'flex';
        }

        /* MÚSICAS (SONIDOS AMBIENTALES CON WEB AUDIO API) */
        const ambientMeta = {
            white: { title: 'Ruido blanco', sub: 'Un sonido constante y suave' },
            rain: { title: 'Lluvia', sub: 'Gotas tranquilas a lo lejos' },
            sea: { title: 'Mar', sub: 'Olas que llegan y se retiran' },
            forest: { title: 'Bosque', sub: 'Una atmósfera natural y ligera' }
        };

        let audioCtx = null;
        let masterGain = null;
        let activeSource = null;
        let activeLfo = null;
        let currentSoundKey = null;
        let isSoundPlaying = false;
        let ambientTimerId = null;

        function stopAudioEngine() {
            if (activeSource) {
                try { activeSource.stop(); } catch (e) {}
                activeSource.disconnect();
                activeSource = null;
            }
            if (activeLfo) {
                try { activeLfo.stop(); } catch (e) {}
                activeLfo.disconnect();
                activeLfo = null;
            }
        }

        function startAudioEngine(key) {
            stopAudioEngine();
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!audioCtx) audioCtx = new AudioContextClass();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const bufferSize = audioCtx.sampleRate * 3;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                if (key === 'white') {
                    data[i] = white * 0.16;
                } else {
                    lastOut = (lastOut + 0.03 * white) / 1.03;
                    data[i] = lastOut * 1.8;
                }
            }

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = audioCtx.createBiquadFilter();
            if (key === 'white') { filter.type = 'lowpass'; filter.frequency.value = 1800; }
            if (key === 'rain') { filter.type = 'bandpass'; filter.frequency.value = 950; filter.Q.value = 0.6; }
            if (key === 'sea') { filter.type = 'lowpass'; filter.frequency.value = 420; }
            if (key === 'forest') { filter.type = 'bandpass'; filter.frequency.value = 520; filter.Q.value = 1.2; }

            masterGain = audioCtx.createGain();
            const vol = document.getElementById('player-volume-range').value / 100;
            const enabled = document.getElementById('player-master-toggle').checked;
            masterGain.gain.value = enabled ? vol * 0.45 : 0;

            if (key === 'sea') {
                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                lfo.frequency.value = 0.14;
                lfoGain.gain.value = 180;
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);
                lfo.start();
                activeLfo = lfo;
            }

            source.connect(filter);
            filter.connect(masterGain);
            masterGain.connect(audioCtx.destination);
            source.start();
            activeSource = source;
        }

        function updateSoundUI() {
            document.querySelectorAll('.sound-card').forEach(card => {
                const key = card.getAttribute('data-sound');
                const isActive = isSoundPlaying && currentSoundKey === key;
                card.classList.toggle('playing', isActive);
                card.querySelector('.sound-action').textContent = isActive ? 'Pausar' : 'Reproducir';
            });

            const btn = document.getElementById('player-play-btn');
            const titleEl = document.getElementById('player-track-title');
            const subEl = document.getElementById('player-track-sub');

            if (currentSoundKey && ambientMeta[currentSoundKey]) {
                titleEl.textContent = ambientMeta[currentSoundKey].title;
                subEl.textContent = isSoundPlaying ? 'Reproduciendo atmósfera...' : 'En pausa · Presiona para continuar';
            } else {
                titleEl.textContent = 'Ningún sonido seleccionado';
                subEl.textContent = 'Elige una tarjeta para comenzar';
            }

            btn.innerHTML = `<i data-lucide="${isSoundPlaying ? 'pause' : 'play'}"></i>`;
            lucide.createIcons();
        }

        function selectAmbientSound(key) {
            if (currentSoundKey === key && isSoundPlaying) {
                stopAudioEngine();
                isSoundPlaying = false;
            } else {
                currentSoundKey = key;
                startAudioEngine(key);
                isSoundPlaying = true;
            }
            updateSoundUI();
        }

        function togglePlayCurrentSound() {
            if (!currentSoundKey) {
                selectAmbientSound('white');
                return;
            }
            if (isSoundPlaying) {
                stopAudioEngine();
                isSoundPlaying = false;
            } else {
                startAudioEngine(currentSoundKey);
                isSoundPlaying = true;
            }
            updateSoundUI();
        }

        function updateAmbientVolume(val) {
            document.getElementById('player-volume-val').textContent = val + '%';
            if (masterGain && document.getElementById('player-master-toggle').checked) {
                masterGain.gain.value = (val / 100) * 0.45;
            }
        }

        function toggleMasterAudio(isOn) {
            if (masterGain) {
                const vol = document.getElementById('player-volume-range').value / 100;
                masterGain.gain.value = isOn ? vol * 0.45 : 0;
            }
            showToast(isOn ? 'Sonido activado' : 'Sonido silenciado');
        }

        function setAmbientTimer(minutes) {
            clearTimeout(ambientTimerId);
            const mins = parseInt(minutes, 10);
            if (mins > 0) {
                showToast(`Temporizador configurado en ${mins} min`);
                ambientTimerId = setTimeout(() => {
                    stopAudioEngine();
                    isSoundPlaying = false;
                    updateSoundUI();
                    showToast('Temporizador finalizado');
                }, mins * 60 * 1000);
            }
        }
        /* BREATHE (RESPIRACIÓN GUIADA) */
        const breathePatterns = {
            '4-4-6': [
                { label: 'Inhala', seconds: 4, scale: 1.14 },
                { label: 'Mantén', seconds: 4, scale: 1.14 },
                { label: 'Exhala', seconds: 6, scale: 0.88 }
            ],
            '4-4-4-4': [
                { label: 'Inhala', seconds: 4, scale: 1.14 },
                { label: 'Mantén', seconds: 4, scale: 1.14 },
                { label: 'Exhala', seconds: 4, scale: 0.88 },
                { label: 'Pausa', seconds: 4, scale: 0.88 }
            ],
            '4-7-8': [
                { label: 'Inhala', seconds: 4, scale: 1.14 },
                { label: 'Mantén', seconds: 7, scale: 1.14 },
                { label: 'Exhala', seconds: 8, scale: 0.88 }
            ]
        };

        let breatheRunning = false;
        let breatheTimerId = null;
        let breathePhaseIndex = 0;
        let breatheSecLeft = 0;

        function applyBreathePhase(phase) {
            const rings = document.getElementById('breathe-rings');
            const stateEl = document.getElementById('breathe-state');
            const subEl = document.getElementById('breathe-sub');

            stateEl.textContent = phase.label;
            subEl.textContent = `${breatheSecLeft} s`;
            rings.style.transitionDuration = `${phase.seconds}s`;
            rings.style.transform = `scale(${phase.scale})`;
        }

        function runBreatheStep() {
            const patternKey = document.getElementById('breathe-pattern-select').value;
            const phases = breathePatterns[patternKey] || breathePatterns['4-4-6'];
            const currentPhase = phases[breathePhaseIndex];

            if (breatheSecLeft <= 0) {
                breatheSecLeft = currentPhase.seconds;
                applyBreathePhase(currentPhase);
            } else {
                document.getElementById('breathe-sub').textContent = `${breatheSecLeft} s`;
            }

            breatheTimerId = setInterval(() => {
                breatheSecLeft -= 1;
                if (breatheSecLeft <= 0) {
                    breathePhaseIndex = (breathePhaseIndex + 1) % phases.length;
                    const nextPhase = phases[breathePhaseIndex];
                    breatheSecLeft = nextPhase.seconds;
                    applyBreathePhase(nextPhase);
                } else {
                    document.getElementById('breathe-sub').textContent = `${breatheSecLeft} s`;
                }
            }, 1000);
        }

        function toggleBreathe() {
            const btn = document.getElementById('btn-breathe-toggle');
            if (breatheRunning) {
                clearInterval(breatheTimerId);
                breatheRunning = false;
                btn.textContent = 'Iniciar';
                document.getElementById('breathe-sub').textContent = 'En pausa · Puedes continuar';
            } else {
                breatheRunning = true;
                btn.textContent = 'Pausar';
                runBreatheStep();
            }
        }

        function resetBreathe() {
            clearInterval(breatheTimerId);
            breatheRunning = false;
            breathePhaseIndex = 0;
            breatheSecLeft = 0;

            const rings = document.getElementById('breathe-rings');
            rings.style.transitionDuration = '0.6s';
            rings.style.transform = 'scale(1)';

            document.getElementById('breathe-state').textContent = 'Listo';
            document.getElementById('breathe-sub').textContent = 'Respira a tu ritmo';
            document.getElementById('btn-breathe-toggle').textContent = 'Iniciar';
        }

        /* CHECKLIST (VERIFICACIÓN FUNCIONAL) */
        const checklistItems = [
            { pantalla: 'Landing y acceso', elemento: 'Controles y navegación' },
            { pantalla: 'Navegación lateral', elemento: 'Controles y navegación' },
            { pantalla: 'Todos los Fidgets', elemento: 'Acción principal' },
            { pantalla: 'Spinner', elemento: 'Acción principal' },
            { pantalla: 'Cubo táctil', elemento: 'Acción principal' },
            { pantalla: 'Pop-it', elemento: 'Acción principal' },
            { pantalla: 'Ondas', elemento: 'Acción principal' },
            { pantalla: 'Slime', elemento: 'Acción principal' },
            { pantalla: 'Geométrico', elemento: 'Acción principal' },
            { pantalla: 'Dibujo libre', elemento: 'Acción principal' },
            { pantalla: 'Check-in', elemento: 'Acción principal' },
            { pantalla: 'Historial', elemento: 'Acción principal' },
            { pantalla: 'Contactos y llamadas', elemento: 'Acción principal' },
            { pantalla: 'S.O.S', elemento: 'Acción principal' },
            { pantalla: 'Músicas', elemento: 'Acción principal' },
            { pantalla: 'Breathe', elemento: 'Acción principal' },
            { pantalla: 'Ajustes y accesibilidad', elemento: 'Acción principal' }
        ];

        function renderChecklistTable() {
            const tbody = document.getElementById('checklist-tbody');
            if (!tbody) return;
            tbody.innerHTML = checklistItems.map(item => `
                <tr>
                    <td>${item.pantalla}</td>
                    <td>${item.elemento}</td>
                    <td>Clic, teclado o puntero</td>
                    <td>Actualiza la vista y da feedback</td>
                    <td><span class="check-badge-yes"><i data-lucide="check"></i> Sí</span></td>
                </tr>
            `).join('');
        }

        renderChecklistTable();
        /* AUTENTICACIÓN, PERSISTENCIA Y AJUSTES CORE */
        const STORAGE_KEY = 'fidget_app_state_v1';

        let userAccount = {
            name: 'Valeria Quispe',
            email: 'valeria@fidget.pe',
            password: '12345678',
            city: 'Lima, Perú',
            avatarDataUrl: ''
        };

        let appPrefs = {
            easyFont: false,
            fontSize: 16,
            hideMetrics: false,
            textOnly: false,
            darkMode: false,
            autoSystemDark: false
        };

        function saveStateToStorage() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    userAccount,
                    appPrefs,
                    personalContact,
                    historyEntries,
                    favoriteFidgets: Array.from(favoriteFidgets)
                }));
            } catch (e) {}
        }

        function loadStateFromStorage() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return;
                const saved = JSON.parse(raw);
                if (saved.userAccount) userAccount = { ...userAccount, ...saved.userAccount };
                if (saved.appPrefs) appPrefs = { ...appPrefs, ...saved.appPrefs };
                if (saved.personalContact) personalContact = { ...personalContact, ...saved.personalContact };
                if (Array.isArray(saved.historyEntries)) historyEntries = saved.historyEntries;
                if (Array.isArray(saved.favoriteFidgets)) {
                    favoriteFidgets.clear();
                    saved.favoriteFidgets.forEach(k => favoriteFidgets.add(k));
                }
            } catch (e) {}
        }

        function applyProfileToUI() {
            document.getElementById('sidebar-user-name').textContent = userAccount.name;
            document.getElementById('sidebar-user-email').textContent = userAccount.email;
            document.getElementById('set-profile-name').value = userAccount.name;
            document.getElementById('set-profile-email').value = userAccount.email;
            document.getElementById('set-profile-city').value = userAccount.city || 'Lima, Perú';

            const sideAv = document.getElementById('sidebar-user-avatar');
            const setAv = document.getElementById('set-avatar-preview');
            if (userAccount.avatarDataUrl) {
                sideAv.innerHTML = `<img src="${userAccount.avatarDataUrl}" alt="Foto de ${userAccount.name}">`;
                setAv.innerHTML = `<img src="${userAccount.avatarDataUrl}" alt="Foto de ${userAccount.name}">`;
            } else {
                const initials = getInitials(userAccount.name);
                sideAv.textContent = initials;
                setAv.textContent = initials;
            }
        }

        function applyPrefsToUI() {
            document.getElementById('set-easy-font').checked = appPrefs.easyFont;
            document.getElementById('a11y-preview-box').classList.toggle('easy-font', appPrefs.easyFont);
            document.getElementById('view-app').classList.toggle('easy-reading', appPrefs.easyFont);

            document.getElementById('set-font-size-range').value = appPrefs.fontSize;
            updateA11yFontSize(appPrefs.fontSize, false);

            document.getElementById('set-hide-metrics').checked = appPrefs.hideMetrics;
            document.getElementById('view-app').classList.toggle('hide-metrics', appPrefs.hideMetrics);

            document.getElementById('set-text-only-sync').checked = appPrefs.textOnly;
            const artToggle = document.getElementById('art-text-only-toggle');
            if (artToggle) {
                artToggle.checked = appPrefs.textOnly;
                toggleArticleTextOnly();
            }

            document.getElementById('set-auto-dark').checked = appPrefs.autoSystemDark;
            const effectiveDark = appPrefs.autoSystemDark
                ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
                : appPrefs.darkMode;
            document.getElementById('set-dark-mode').checked = effectiveDark;
            document.getElementById('view-app').classList.toggle('dark-mode', effectiveDark);
        }

        function switchAuthMode(mode) {
            const isReg = mode === 'register';
            document.getElementById('auth-login-box').style.display = isReg ? 'none' : 'block';
            document.getElementById('auth-register-box').style.display = isReg ? 'block' : 'none';
            document.getElementById('login-alert').className = 'auth-alert';
            document.getElementById('register-alert').className = 'auth-alert';
        }

        function togglePassVisibility(inputId, btnEl) {
            const inp = document.getElementById(inputId);
            const isPass = inp.type === 'password';
            inp.type = isPass ? 'text' : 'password';
            btnEl.textContent = isPass ? 'Ocultar' : 'Mostrar';
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        /* HU-006 + HU-024: Registro de nuevo usuario */
        function handleRegisterSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value;
            const privacyOk = document.getElementById('reg-privacy-check').checked;
            const alertBox = document.getElementById('register-alert');

            document.getElementById('err-reg-name').classList.toggle('show', !name);
            document.getElementById('err-reg-email').classList.toggle('show', !isValidEmail(email));
            document.getElementById('err-reg-password').classList.toggle('show', pass.length < 8);

            if (!name || !isValidEmail(email) || pass.length < 8) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = !isValidEmail(email) ? 'Ingrese un correo válido.' : 'Completa correctamente los campos obligatorios.';
                return;
            }
            if (!privacyOk) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'Debes aceptar las Políticas de Privacidad para continuar.';
                return;
            }

            userAccount = { name, email, password: pass, city: 'Lima, Perú', avatarDataUrl: '' };
            saveStateToStorage();
            applyProfileToUI();
            showAppTab('dashboard');
            showToast(`¡Bienvenida/o, ${name}!`);
        }

        /* HU-007: Inicio de sesión */
        function handleLoginSubmit(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value;
            const alertBox = document.getElementById('login-alert');

            const isDemoMatch = (email.toLowerCase() === 'valeria@fidget.pe' && pass === '12345678');
            const isStoredMatch = (email.toLowerCase() === userAccount.email.toLowerCase() && pass === userAccount.password);

            if (!email || !pass || (!isDemoMatch && !isStoredMatch)) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'Credenciales incorrectas';
                return;
            }

            alertBox.className = 'auth-alert';
            applyProfileToUI();
            showAppTab('dashboard');
        }

        function loginWithDemoAccount() {
            applyProfileToUI();
            showAppTab('dashboard');
        }

        /* Modales (HU-008, HU-009, HU-015, HU-024, HU-040) */
        function closeAllModals() {
            document.querySelectorAll('.app-modal-backdrop').forEach(m => m.classList.add('hidden'));
        }

        function openRecoveryModal() {
            closeAllModals();
            document.getElementById('rec-email').value = '';
            document.getElementById('rec-alert').className = 'auth-alert';
            document.getElementById('modal-recovery').classList.remove('hidden');
        }

        function handleRecoverySubmit(e) {
            e.preventDefault();
            const email = document.getElementById('rec-email').value.trim();
            const alertBox = document.getElementById('rec-alert');
            if (!isValidEmail(email)) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'Ingrese un correo electrónico válido.';
                return;
            }
            alertBox.className = 'auth-alert success';
            alertBox.textContent = 'Si el correo está asociado, recibirás un enlace temporal válido por 24 horas.';
        }

        function openPrivacyModal() {
            closeAllModals();
            const modal = document.getElementById('modal-privacy');
            modal.classList.remove('hidden');
            modal.querySelector('.app-modal-card').style.fontFamily = appPrefs.easyFont ? 'Verdana, sans-serif' : '';
        }

        function openLogoutModal() {
            closeAllModals();
            document.getElementById('modal-logout').classList.remove('hidden');
        }

        function confirmLogout() {
            closeAllModals();
            showLoginView('login');
            showToast('Sesión cerrada de forma segura');
        }

        function openChangePasswordModal() {
            closeAllModals();
            document.getElementById('cp-current').value = '';
            document.getElementById('cp-new').value = '';
            document.getElementById('cp-confirm').value = '';
            document.getElementById('pass-alert').className = 'auth-alert';
            document.getElementById('modal-change-pass').classList.remove('hidden');
        }

        function handleChangePassword(e) {
            e.preventDefault();
            const curr = document.getElementById('cp-current').value;
            const next = document.getElementById('cp-new').value;
            const conf = document.getElementById('cp-confirm').value;
            const alertBox = document.getElementById('pass-alert');

            if (curr !== userAccount.password) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'La contraseña actual no es correcta.';
                return;
            }
            if (next.length < 8) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
                return;
            }
            if (next !== conf) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'Las nuevas contraseñas no coinciden.';
                return;
            }

            userAccount.password = next;
            saveStateToStorage();
            closeAllModals();
            showToast('Contraseña actualizada correctamente');
        }

        function openDeleteAccountModal() {
            closeAllModals();
            document.getElementById('del-acc-pass').value = '';
            document.getElementById('del-acc-alert').className = 'auth-alert';
            document.getElementById('modal-delete-account').classList.remove('hidden');
        }

        function handleDeleteAccount(e) {
            e.preventDefault();
            const pass = document.getElementById('del-acc-pass').value;
            const alertBox = document.getElementById('del-acc-alert');
            if (pass !== userAccount.password) {
                alertBox.className = 'auth-alert error';
                alertBox.textContent = 'Contraseña incorrecta. No se eliminó la cuenta.';
                return;
            }
            localStorage.removeItem(STORAGE_KEY);
            userAccount = { name: 'Valeria Quispe', email: 'valeria@fidget.pe', password: '12345678', city: 'Lima, Perú', avatarDataUrl: '' };
            historyEntries = [];
            applyProfileToUI();
            renderHistoryEntries();
            closeAllModals();
            showWelcomeView();
            showToast('Cuenta y datos eliminados permanentemente');
        }

        /* Ajustes Core (HU-004, HU-010, HU-022, HU-028, HU-029, HU-044) */
        function showSettingsSection(secKey) {
            document.querySelectorAll('.settings-section').forEach(sec => sec.classList.add('hidden'));
            const target = document.getElementById('set-' + secKey);
            if (target) target.classList.remove('hidden');
            document.querySelectorAll('#settings-nav .settings-nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-sec') === secKey);
            });
        }

        function handleAvatarUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                showToast('Solo se permiten imágenes JPG o PNG');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('La imagen excede los 5MB permitidos');
                return;
            }
            const reader = new FileReader();
            reader.onload = ev => {
                userAccount.avatarDataUrl = ev.target.result;
                saveStateToStorage();
                applyProfileToUI();
                showToast('Foto de perfil actualizada');
            };
            reader.readAsDataURL(file);
        }

        function saveUserProfile(e) {
            e.preventDefault();
            userAccount.name = document.getElementById('set-profile-name').value.trim() || 'Valeria Quispe';
            userAccount.email = document.getElementById('set-profile-email').value.trim() || 'valeria@fidget.pe';
            userAccount.city = document.getElementById('set-profile-city').value.trim() || 'Lima, Perú';
            saveStateToStorage();
            applyProfileToUI();
            showToast('Perfil actualizado correctamente');
        }

        function toggleEasyFont(enabled) {
            appPrefs.easyFont = enabled;
            saveStateToStorage();
            applyPrefsToUI();
            showToast(enabled ? 'Fuente de lectura fácil activada' : 'Fuente estándar restaurada');
        }

        function updateA11yFontSize(px, notify = true) {
            appPrefs.fontSize = parseInt(px, 10);
            document.getElementById('set-font-size-val').textContent = px + 'px';
            document.getElementById('a11y-preview-title').style.fontSize = (appPrefs.fontSize + 2) + 'px';
            document.getElementById('a11y-preview-text').style.fontSize = appPrefs.fontSize + 'px';
            if (notify) saveStateToStorage();
        }

        function toggleHideMetrics(enabled) {
            appPrefs.hideMetrics = enabled;
            saveStateToStorage();
            applyPrefsToUI();
            showToast(enabled ? 'Métricas numéricas ocultas' : 'Métricas numéricas visibles');
        }

        function syncTextOnlyMode(enabled) {
            appPrefs.textOnly = enabled;
            saveStateToStorage();
            applyPrefsToUI();
            showToast(enabled ? 'Modo solo texto activado en Artículos' : 'Ilustraciones activadas en Artículos');
        }

        function toggleDarkMode(enabled) {
            appPrefs.darkMode = enabled;
            appPrefs.autoSystemDark = false;
            saveStateToStorage();
            applyPrefsToUI();
            showToast(enabled ? 'Modo oscuro activado' : 'Modo claro activado');
        }

        function toggleAutoSystemDark(enabled) {
            appPrefs.autoSystemDark = enabled;
            saveStateToStorage();
            applyPrefsToUI();
            showToast(enabled ? 'Apariencia sincronizada con tu sistema' : 'Modo manual restaurado');
        }

        function syncMuteAll(isMuted) {
            const masterToggle = document.getElementById('player-master-toggle');
            if (masterToggle) {
                masterToggle.checked = !isMuted;
                toggleMasterAudio(!isMuted);
            }
            if (isMuted && isSoundPlaying) {
                stopAudioEngine();
                isSoundPlaying = false;
                updateSoundUI();
            }
        }

        /* SPINNER INTERACTIVO (FÍSICA DE ARRASTRE Y CONTROLES) */
        const spinnerPalettes = {
            blue:   { c1: '#3783c2', c2: '#1d5a8c', ring: '#235c88', center: '#dff0fe' },
            green:  { c1: '#6ca896', c2: '#3f7364', ring: '#2f5c4f', center: '#e3f4ee' },
            purple: { c1: '#9e7cb8', c2: '#6b4d85', ring: '#533969', center: '#f2eaf9' },
            coral:  { c1: '#cf8365', c2: '#9c563c', ring: '#7d402a', center: '#fbede7' }
        };

        let spAngle = 0;
        let spVelocity = 0;
        let spTotalDeg = 0;
        let spDragging = false;
        let spDragMoved = 0;
        let spLastPointerAngle = 0;
        let spLastMoveTime = 0;
        let spRafId = null;
        let spMuted = false;
        let spLastTickStep = 0;
        let spEventsBound = false;
        let spTimerInterval = null;
        let spTimerIdx = 0;
        const spTimerSteps = [0, 60, 180, 300];

        function openSpinnerView() {
            hideMainViews();
            document.getElementById('view-spinner').classList.remove('hidden');
            bindSpinnerEvents();
            startSpinnerLoop();
            lucide.createIcons();
        }

        function closeSpinnerView() {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            cancelAnimationFrame(spRafId);
            spRafId = null;
            spDragging = false;
            document.getElementById('view-spinner').classList.add('hidden');
            document.getElementById('view-app').classList.remove('hidden');
        }

        function setSpinnerColor(colorKey, btnEl) {
            const p = spinnerPalettes[colorKey] || spinnerPalettes.blue;
            const wheel = document.getElementById('sp-wheel');
            wheel.style.setProperty('--wheel-c1', p.c1);
            wheel.style.setProperty('--wheel-c2', p.c2);
            wheel.style.setProperty('--wheel-ring', p.ring);
            wheel.style.setProperty('--wheel-center', p.center);

            document.querySelectorAll('#sp-color-row .sp-color-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
        }

        function toggleSpinnerFavorite() {
            const btn = document.getElementById('sp-fav-btn');
            const isFav = btn.classList.toggle('fav-active');
            showToast(isFav ? 'Spinner guardado en favoritos' : 'Quitado de favoritos');
        }

        function toggleSpinnerFullscreen() {
            const spView = document.getElementById('view-spinner');
            if (!document.fullscreenElement) {
                if (spView.requestFullscreen) spView.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        function toggleSpinnerMute() {
            spMuted = !spMuted;
            const btn = document.getElementById('sp-mute-btn');
            btn.innerHTML = `<i data-lucide="${spMuted ? 'volume-x' : 'volume-2'}"></i><span>${spMuted ? 'Silenciado' : 'Mute'}</span>`;
            lucide.createIcons();
        }

        function playSpinnerTick() {
            if (spMuted) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!audioCtx) audioCtx = new AudioContextClass();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.035);
            } catch (e) {}
        }

        function cycleSpinnerTimer() {
            clearInterval(spTimerInterval);
            spTimerIdx = (spTimerIdx + 1) % spTimerSteps.length;
            let secs = spTimerSteps[spTimerIdx];
            const btn = document.getElementById('sp-timer-btn');

            if (secs === 0) {
                btn.textContent = 'Temporizador';
                showToast('Temporizador desactivado');
                return;
            }

            const formatSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
            btn.textContent = formatSecs(secs);
            showToast(`Temporizador de ${secs / 60} min iniciado`);

            spTimerInterval = setInterval(() => {
                secs -= 1;
                if (secs <= 0) {
                    clearInterval(spTimerInterval);
                    spTimerIdx = 0;
                    btn.textContent = 'Temporizador';
                    showToast('Tiempo de pausa completado');
                } else {
                    btn.textContent = formatSecs(secs);
                }
            }, 1000);
        }

        function getSpinnerPointerAngle(clientX, clientY) {
            const stage = document.getElementById('sp-stage');
            const rect = stage.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
        }

        function startSpinnerLoop() {
            if (spRafId) cancelAnimationFrame(spRafId);
            const wheel = document.getElementById('sp-wheel');
            const rpmEl = document.getElementById('sp-rpm-val');
            const turnsEl = document.getElementById('sp-turns-val');

            function tick() {
                if (!spDragging) {
                    spAngle += spVelocity;
                    spTotalDeg += Math.abs(spVelocity);
                    spVelocity *= 0.988;
                    if (Math.abs(spVelocity) < 0.04) spVelocity = 0;
                }

                wheel.style.transform = `rotate(${spAngle}deg)`;

                const tickStep = Math.floor(spTotalDeg / 120);
                if (tickStep > spLastTickStep && Math.abs(spVelocity) > 1.2) {
                    spLastTickStep = tickStep;
                    playSpinnerTick();
                }

                rpmEl.textContent = Math.round(Math.abs(spVelocity) * 10);
                turnsEl.textContent = Math.floor(spTotalDeg / 360);

                spRafId = requestAnimationFrame(tick);
            }

            spRafId = requestAnimationFrame(tick);
        }

        function bindSpinnerEvents() {
            if (spEventsBound) return;
            const stage = document.getElementById('sp-stage');
            if (!stage) return;
            spEventsBound = true;

            const onStart = (clientX, clientY) => {
                spDragging = true;
                spDragMoved = 0;
                spVelocity = 0;
                spLastPointerAngle = getSpinnerPointerAngle(clientX, clientY);
                spLastMoveTime = performance.now();
            };

            const onMove = (clientX, clientY) => {
                if (!spDragging) return;
                const currentAngle = getSpinnerPointerAngle(clientX, clientY);
                let delta = currentAngle - spLastPointerAngle;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                spAngle += delta;
                spTotalDeg += Math.abs(delta);
                spDragMoved += Math.abs(delta);

                const now = performance.now();
                const dt = Math.max(now - spLastMoveTime, 8);
                const instantVel = (delta / dt) * 16.6;
                spVelocity = spVelocity * 0.4 + instantVel * 0.6;

                spLastPointerAngle = currentAngle;
                spLastMoveTime = now;
            };

            const onEnd = () => {
                if (!spDragging) return;
                spDragging = false;
                if (spDragMoved < 4) {
                    spVelocity = 18;
                } else if (performance.now() - spLastMoveTime > 180) {
                    spVelocity = 0;
                }
                spVelocity = Math.max(-45, Math.min(45, spVelocity));
            };

            stage.addEventListener('pointerdown', e => {
                e.preventDefault();
                onStart(e.clientX, e.clientY);
            });

            window.addEventListener('pointermove', e => {
                if (!spDragging) return;
                onMove(e.clientX, e.clientY);
            });

            window.addEventListener('pointerup', onEnd);
            window.addEventListener('pointercancel', onEnd);
        }

        bindSpinnerEvents();

        /* FAVORITOS SINCRONIZADOS + ENLACES AUTOMÁTICOS DE FIDGETS */
        const fidgetCatalogMeta = {
            cube:    { key: 'cube',    title: 'Cubo táctil',    cat: 'APRETAR',    desc: 'Botones, interruptores, dial y joystick en un solo espacio.', bg: 'cube',       art: '<div class="drawing-cube"><div style="background:#2D6EFF;"></div><div style="background:#4784c4;"></div><div style="background:#235889;"></div><div style="background:#8ab6a7;"></div></div>' },
            popit:   { key: 'popit',   title: 'Pop-it suave',   cat: 'APRETAR',    desc: 'Presiona burbujas a tu ritmo, sin prisa.',                     bg: 'popit',      art: '<div class="drawing-popit"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>' },
            ondas:   { key: 'ondas',   title: 'Ondas',          cat: 'APRETAR',    desc: 'Crea ondas calmadas con cada toque o movimiento.',             bg: 'ondas',      art: '<div class="drawing-ondas"><div><div></div></div></div>' },
            spinner: { key: 'spinner', title: 'Spinner',        cat: 'ROTATORIOS', desc: 'Gira, observa y deja que el movimiento encuentre su ritmo.',   bg: 'spinner-bg', art: '<div class="windmill-shape"><div class="blade blade-1"></div><div class="blade blade-2"></div><div class="blade blade-3"></div><div class="windmill-center"></div></div>' },
            geo:     { key: 'geo',     title: 'Geométrico',     cat: 'EXCLUSIVOS', desc: 'Formas que respiran lentamente contigo.',                      bg: 'geo',        art: '<div class="drawing-geo"><div><div></div></div></div>' },
            slime:   { key: 'slime',   title: 'Slime elástico', cat: 'ESTIRAR',    desc: 'Estira una forma suave y deja que vuelva al centro.',          bg: 'slime',      art: '<div class="drawing-slime"></div>' }
        };

        const titleToFidgetKey = {
            'Cubo táctil': 'cube',
            'Pop-it suave': 'popit',
            'Ondas': 'ondas',
            'Spinner': 'spinner',
            'Geométrico': 'geo',
            'Slime elástico': 'slime'
        };

        const favoriteFidgets = new Set(['popit', 'spinner']);

        function openFidgetByKey(key) {
            if (key === 'spinner') openSpinnerView();
            else if (key === 'popit') openPopitView();
            else if (key === 'ondas') openOndasView();
            else if (key === 'cube') openCubeView();
            else showToast('Herramienta en construcción');
        }

        function closeFidgetView() {
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            cancelAnimationFrame(spRafId);
            spRafId = null;
            cancelAnimationFrame(ondasRafId);
            ondasRafId = null;
            hideMainViews();
            document.getElementById('view-app').classList.remove('hidden');
        }

        function toggleElementFullscreen(viewId) {
            const el = document.getElementById(viewId);
            if (!document.fullscreenElement) {
                if (el && el.requestFullscreen) el.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        function toggleFidgetGlobalMute() {
            spMuted = !spMuted;
            const icon = spMuted ? 'volume-x' : 'volume-2';
            const text = spMuted ? 'Silenciado' : 'Mute';
            document.querySelectorAll('.fidget-mute-btn, #sp-mute-btn').forEach(btn => {
                btn.innerHTML = `<i data-lucide="${icon}"></i><span>${text}</span>`;
            });
            lucide.createIcons();
        }

        function playSoftTone(freq, duration, vol = 0.04, type = 'sine') {
            if (spMuted) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!audioCtx) audioCtx = new AudioContextClass();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(vol, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0008, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {}
        }

        function toggleFavorite(key) {
            if (!fidgetCatalogMeta[key]) return;
            const added = !favoriteFidgets.has(key);
            if (added) favoriteFidgets.add(key);
            else favoriteFidgets.delete(key);
            syncFavoritesUI();
            showToast(added ? `${fidgetCatalogMeta[key].title} agregado a favoritos` : `${fidgetCatalogMeta[key].title} quitado de favoritos`);
        }

        function toggleSpinnerFavorite() {
            toggleFavorite('spinner');
        }

        function syncFavoritesUI() {
            // 1. Corazones en todas las tarjetas del catálogo e Inicio
            document.querySelectorAll('.fidget-card, .list-card').forEach(card => {
                const titleEl = card.querySelector('.fc-title');
                const heartEl = card.querySelector('.fc-heart');
                if (!titleEl || !heartEl) return;
                const key = titleToFidgetKey[titleEl.textContent.trim()];
                if (!key) return;
                const isFav = favoriteFidgets.has(key);
                heartEl.classList.toggle('is-fav', isFav);
                heartEl.innerHTML = `<i data-lucide="heart" style="color:${isFav ? '#d93025' : 'var(--text-dark)'};${isFav ? 'fill:#d93025;' : ''}"></i>`;
            });

            // 2. Corazones en las vistas dedicadas
            document.querySelectorAll('[data-fidget-fav]').forEach(btn => {
                btn.classList.toggle('fav-active', favoriteFidgets.has(btn.getAttribute('data-fidget-fav')));
            });
            const spFavBtn = document.getElementById('sp-fav-btn');
            if (spFavBtn) spFavBtn.classList.toggle('fav-active', favoriteFidgets.has('spinner'));

            // 3. Contador en el shortcut de "Todos los Fidgets"
            const shortcutFavDesc = document.querySelector('#tab-all .shortcut-card .shortcut-desc');
            if (shortcutFavDesc) shortcutFavDesc.textContent = `${favoriteFidgets.size} guardados`;

            // 4. Re-renderizar pestaña Favoritos
            const favGrid = document.querySelector('#tab-favorites .grid-2-cols');
            const favHeader = document.querySelector('#tab-favorites .list-header');
            if (favGrid && favHeader) {
                favHeader.textContent = `${favoriteFidgets.size} fidgets para explorar`;
                if (favoriteFidgets.size === 0) {
                    favGrid.innerHTML = '<div class="history-empty" style="grid-column: 1 / -1;">Aún no tienes favoritos. Toca el corazón en cualquier fidget para guardarlo aquí.</div>';
                } else {
                    favGrid.innerHTML = Array.from(favoriteFidgets).map(key => {
                        const f = fidgetCatalogMeta[key];
                        return `
                            <div class="list-card ${key === 'spinner' ? '' : 'inactive'}">
                                <div class="fc-image ${f.bg}">
                                    <div class="fc-heart is-fav" onclick="event.stopPropagation(); toggleFavorite('${f.key}')">
                                        <i data-lucide="heart" style="color:#d93025; fill:#d93025;"></i>
                                    </div>
                                    ${f.art}
                                </div>
                                <div class="fc-content">
                                    <span class="fc-eyebrow">${f.cat}</span>
                                    <h4 class="fc-title">${f.title}</h4>
                                    <p class="fc-desc">${f.desc}</p>
                                    <a href="#" class="fc-link" onclick="event.preventDefault(); openFidgetByKey('${f.key}')">Abrir &rarr;</a>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
            lucide.createIcons();
        }

        function bindAllCardInteractions() {
            document.querySelectorAll('.fidget-card, .list-card').forEach(card => {
                const titleEl = card.querySelector('.fc-title');
                if (!titleEl) return;
                const key = titleToFidgetKey[titleEl.textContent.trim()];
                if (!key) return;

                const heartEl = card.querySelector('.fc-heart');
                if (heartEl) {
                    heartEl.onclick = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(key);
                    };
                }

                const linkEl = card.querySelector('.fc-link');
                if (linkEl) {
                    linkEl.onclick = e => {
                        e.preventDefault();
                        openFidgetByKey(key);
                    };
                }
            });

            // Conectar botón de vista previa en Calm Games
            const calmPreviewBtn = document.querySelector('#tab-calm-games .preview-btn');
            if (calmPreviewBtn) calmPreviewBtn.onclick = () => openPopitView();
        }

        /* REINICIAR SPINNER */
        function resetSpinner() {
            spAngle = 0;
            spVelocity = 0;
            spTotalDeg = 0;
            spLastTickStep = 0;
            const wheel = document.getElementById('sp-wheel');
            if (wheel) wheel.style.transform = 'rotate(0deg)';
            document.getElementById('sp-rpm-val').textContent = '0';
            document.getElementById('sp-turns-val').textContent = '0';
            showToast('Spinner reiniciado');
        }

        /* POP-IT SUAVE (36 BURBUJAS + ARRASTRE + 4 PALETAS) */
        const popitPalettes = {
            coral:  { board: '#d28774', light: '#f6c4b5', mid: '#dd9684', dark: '#b66b58', inTop: '#a75c4a', inBot: '#d48c7a' },
            ocean:  { board: '#6f9fc2', light: '#c3dff2', mid: '#84b2d4', dark: '#5484a6', inTop: '#467291', inBot: '#7ba7c7' },
            forest: { board: '#7ea68a', light: '#c7e3ce', mid: '#91b89c', dark: '#618a6d', inTop: '#51785c', inBot: '#86ad91' },
            lilac:  { board: '#a692bf', light: '#dfd3ed', mid: '#b6a3cf', dark: '#8874a1', inTop: '#76638f', inBot: '#ac99c4' }
        };

        let popitDragging = false;
        let popitDragTargetState = true;
        let popitInitialized = false;

        function initPopitBoard() {
            if (popitInitialized) return;
            const board = document.getElementById('popit-board');
            if (!board) return;
            popitInitialized = true;

            for (let i = 0; i < 36; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pop-bubble';
                btn.setAttribute('aria-label', `Burbuja ${i + 1}`);

                btn.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    popitDragging = true;
                    popitDragTargetState = !btn.classList.contains('popped');
                    setBubbleState(btn, popitDragTargetState);
                });

                btn.addEventListener('pointerenter', () => {
                    if (popitDragging) setBubbleState(btn, popitDragTargetState);
                });

                board.appendChild(btn);
            }

            window.addEventListener('pointerup', () => { popitDragging = false; });
        }

        function setBubbleState(btn, shouldPop) {
            const wasPopped = btn.classList.contains('popped');
            if (wasPopped === shouldPop) return;
            btn.classList.toggle('popped', shouldPop);
            playSoftTone(shouldPop ? 420 : 300, 0.06, 0.05, 'triangle');
            updatePopitCounter();
        }

        function updatePopitCounter() {
            const count = document.querySelectorAll('#popit-board .pop-bubble.popped').length;
            document.getElementById('popit-counter').textContent = `Burbujas presionadas: ${count} / 36`;
        }

        function setPopitPalette(key, btnEl) {
            const p = popitPalettes[key] || popitPalettes.coral;
            const board = document.getElementById('popit-board');
            board.style.setProperty('--pop-board', p.board);
            board.style.setProperty('--pop-light', p.light);
            board.style.setProperty('--pop-mid', p.mid);
            board.style.setProperty('--pop-dark', p.dark);
            board.style.setProperty('--pop-in-top', p.inTop);
            board.style.setProperty('--pop-in-bot', p.inBot);

            document.querySelectorAll('#popit-palette-row .popit-pal-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
        }

        function resetPopit() {
            document.querySelectorAll('#popit-board .pop-bubble').forEach(b => b.classList.remove('popped'));
            updatePopitCounter();
            showToast('Pop-it reiniciado');
        }

        function openPopitView() {
            initPopitBoard();
            hideMainViews();
            document.getElementById('view-popit').classList.remove('hidden');
            syncFavoritesUI();
        }

        /* ONDAS (CANVAS DE ONDAS DE AGUA + 4 COLORES) */
        const ondasColors = {
            blue:   '85, 133, 202',
            green:  '109, 158, 140',
            purple: '159, 128, 184',
            coral:  '202, 131, 104'
        };

        let ondasCurrentRgb = ondasColors.blue;
        let ondasRipples = [];
        let ondasCount = 0;
        let ondasRafId = null;
        let ondasPointerDown = false;
        let ondasHoldTimer = null;
        let ondasLastX = 0;
        let ondasLastY = 0;
        let ondasLastDragTime = 0;
        let ondasBound = false;

        function resizeOndasCanvas() {
            const canvas = document.getElementById('ondas-canvas');
            const stage = document.getElementById('ondas-stage');
            if (!canvas || !stage) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = stage.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawnWave(x, y, withSound = true) {
            ondasRipples.push({ x, y, r: 8, maxR: 190, alpha: 0.55, rgb: ondasCurrentRgb });
            ondasRipples.push({ x, y, r: 2, maxR: 130, alpha: 0.35, rgb: ondasCurrentRgb });
            ondasCount += 1;
            document.getElementById('ondas-count-val').textContent = ondasCount;
            if (withSound) playSoftTone(360 + Math.random() * 140, 0.14, 0.03, 'sine');
        }

        function startOndasLoop() {
            if (ondasRafId) cancelAnimationFrame(ondasRafId);
            const canvas = document.getElementById('ondas-canvas');
            const ctx = canvas.getContext('2d');

            function draw() {
                const rect = canvas.getBoundingClientRect();
                ctx.clearRect(0, 0, rect.width, rect.height);

                for (let i = ondasRipples.length - 1; i >= 0; i--) {
                    const w = ondasRipples[i];
                    w.r += 2.2;
                    w.alpha *= 0.972;

                    if (w.alpha < 0.015 || w.r > w.maxR) {
                        ondasRipples.splice(i, 1);
                        continue;
                    }

                    ctx.beginPath();
                    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${w.rgb}, ${w.alpha})`;
                    ctx.lineWidth = 2.4;
                    ctx.stroke();
                }

                ondasRafId = requestAnimationFrame(draw);
            }

            ondasRafId = requestAnimationFrame(draw);
        }

        function bindOndasEvents() {
            if (ondasBound) return;
            const stage = document.getElementById('ondas-stage');
            if (!stage) return;
            ondasBound = true;

            const getLocalPos = e => {
                const rect = stage.getBoundingClientRect();
                return { x: e.clientX - rect.left, y: e.clientY - rect.top };
            };

            stage.addEventListener('pointerdown', e => {
                ondasPointerDown = true;
                const pos = getLocalPos(e);
                ondasLastX = pos.x;
                ondasLastY = pos.y;
                spawnWave(pos.x, pos.y, true);

                clearInterval(ondasHoldTimer);
                ondasHoldTimer = setInterval(() => {
                    if (ondasPointerDown) spawnWave(ondasLastX, ondasLastY, false);
                }, 420);
            });

            stage.addEventListener('pointermove', e => {
                if (!ondasPointerDown) return;
                const pos = getLocalPos(e);
                ondasLastX = pos.x;
                ondasLastY = pos.y;
                const now = performance.now();
                if (now - ondasLastDragTime > 120) {
                    ondasLastDragTime = now;
                    spawnWave(pos.x, pos.y, false);
                }
            });

            const stopOndas = () => {
                ondasPointerDown = false;
                clearInterval(ondasHoldTimer);
            };
            window.addEventListener('pointerup', stopOndas);
            window.addEventListener('pointercancel', stopOndas);
            window.addEventListener('resize', () => {
                if (!document.getElementById('view-ondas').classList.contains('hidden')) resizeOndasCanvas();
            });
        }

        function setOndasColor(key, btnEl) {
            ondasCurrentRgb = ondasColors[key] || ondasColors.blue;
            document.querySelectorAll('#ondas-color-row .sp-color-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
        }

        function resetOndas() {
            ondasRipples = [];
            ondasCount = 0;
            document.getElementById('ondas-count-val').textContent = '0';
            showToast('Ondas reiniciadas');
        }

        function openOndasView() {
            bindOndasEvents();
            hideMainViews();
            document.getElementById('view-ondas').classList.remove('hidden');
            resizeOndasCanvas();
            startOndasLoop();
            syncFavoritesUI();
        }

        /* CUBO TÁCTIL (6 CONTROLES INTERACTIVOS) */
        let cubeInteractions = 0;
        let cubeDialDeg = 0;
        let cubeJoyBound = false;

        function addCubeInteraction(freq = 320) {
            cubeInteractions += 1;
            document.getElementById('cube-counter').textContent = `${cubeInteractions} interacciones`;
            playSoftTone(freq, 0.05, 0.045, 'triangle');
        }

        function pressCubeButton(btnEl) {
            btnEl.classList.add('pressed');
            setTimeout(() => btnEl.classList.remove('pressed'), 120);
            addCubeInteraction(460);
        }

        function toggleCubeSwitch(swEl) {
            const isOn = swEl.classList.toggle('on');
            addCubeInteraction(isOn ? 520 : 340);
        }

        function rotateCubeDial() {
            cubeDialDeg += 45;
            document.getElementById('cube-dial').style.transform = `rotate(${cubeDialDeg}deg)`;
            addCubeInteraction(280);
        }

        function bindCubeJoystick() {
            if (cubeJoyBound) return;
            const base = document.getElementById('cube-joy-base');
            const stick = document.getElementById('cube-joy-stick');
            if (!base || !stick) return;
            cubeJoyBound = true;

            let dragging = false;
            let countedDrag = false;
            const maxR = 26;

            const moveStick = (clientX, clientY) => {
                const rect = base.getBoundingClientRect();
                const dx = clientX - (rect.left + rect.width / 2);
                const dy = clientY - (rect.top + rect.height / 2);
                const dist = Math.hypot(dx, dy);
                const clamped = Math.min(dist, maxR);
                const angle = Math.atan2(dy, dx);
                const tx = Math.cos(angle) * clamped;
                const ty = Math.sin(angle) * clamped;
                stick.style.transform = `translate(${tx}px, ${ty}px)`;

                if (!countedDrag && dist > 10) {
                    countedDrag = true;
                    addCubeInteraction(240);
                }
            };

            base.addEventListener('pointerdown', e => {
                e.preventDefault();
                dragging = true;
                countedDrag = false;
                stick.classList.add('dragging');
                moveStick(e.clientX, e.clientY);
            });

            window.addEventListener('pointermove', e => {
                if (!dragging) return;
                moveStick(e.clientX, e.clientY);
            });

            const releaseStick = () => {
                if (!dragging) return;
                dragging = false;
                stick.classList.remove('dragging');
                stick.style.transform = 'translate(0px, 0px)';
            };

            window.addEventListener('pointerup', releaseStick);
            window.addEventListener('pointercancel', releaseStick);
        }

        function resetCube() {
            cubeInteractions = 0;
            cubeDialDeg = 0;
            document.getElementById('cube-counter').textContent = '0 interacciones';
            document.querySelectorAll('#view-cube .cube-switch').forEach(s => s.classList.remove('on'));
            document.getElementById('cube-dial').style.transform = 'rotate(0deg)';
            document.getElementById('cube-joy-stick').style.transform = 'translate(0px, 0px)';
            showToast('Cubo táctil reiniciado');
        }

        function openCubeView() {
            bindCubeJoystick();
            hideMainViews();
            document.getElementById('view-cube').classList.remove('hidden');
            syncFavoritesUI();
        }

        bindAllCardInteractions();
        syncFavoritesUI();

        /* HU-005: CHECK-IN RÁPIDO DIARIO EN INICIO */
        let lastQuickCheckinDate = '';

        function getTodayKey() {
            const d = new Date();
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        }

        function hasTodayQuickCheckin() {
            const todayKey = getTodayKey();
            return historyEntries.some(item => item.quickDayKey === todayKey);
        }

        function syncQuickCheckinCard() {
            const doneToday = hasTodayQuickCheckin();
            if (!doneToday) lastQuickCheckinDate = '';
            const card = document.getElementById('dashboard-quick-checkin');
            const doneBox = document.getElementById('dashboard-checkin-done');
            if (card) card.style.display = doneToday ? 'none' : 'flex';
            if (doneBox) doneBox.style.display = doneToday ? 'flex' : 'none';
        }

        function handleQuickCheckin(moodLabel, moodClass) {
            if (hasTodayQuickCheckin()) {
                showToast('Tu registro diario ya fue guardado. Ve a Historial para modificarlo.');
                return;
            }
            const now = new Date();
            const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
            const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            historyEntries.unshift({
                id: Date.now(),
                mood: moodLabel,
                moodClass,
                note: 'Check-in rápido desde Inicio.',
                date: formattedDate,
                month: 'nov',
                quickDayKey: getTodayKey()
            });

            lastQuickCheckinDate = getTodayKey();
            saveStateToStorage();
            renderHistoryEntries();
            syncQuickCheckinCard();
            showToast(`Estado "${moodLabel}" guardado en tu historial`);
        }

        /* HU-030: MENSAJES MOTIVACIONALES CON BOTÓN REFRESCAR */
        const motivationalQuotes = [
            'Tu ritmo también es una forma de avanzar.',
            'No tienes que resolver todo hoy; respira un minuto a la vez.',
            'Hacer una pausa a tiempo también es cuidar tu enfoque.',
            'Está bien bajar la intensidad cuando el entorno se siente fuerte.',
            'Cada pequeño paso cuenta, incluso los más silenciosos.'
        ];
        let quoteIdx = 0;

        function refreshMotivationQuote() {
            quoteIdx = (quoteIdx + 1) % motivationalQuotes.length;
            const el = document.getElementById('dashboard-quote-text');
            if (el) el.textContent = motivationalQuotes[quoteIdx];
        }

        /* HU-026 + HU-028: TEMPORIZADOR (1, 3, 5 MIN) Y SILENCIADO SUAVE (FADE-OUT) */
        spTimerSteps.splice(0, spTimerSteps.length, 0, 60, 180, 300);

        function dismissSoftTimerBanner() {
            document.getElementById('soft-timer-banner').classList.add('hidden');
        }

        cycleSpinnerTimer = function() {
            clearInterval(spTimerInterval);
            spTimerIdx = (spTimerIdx + 1) % spTimerSteps.length;
            let secs = spTimerSteps[spTimerIdx];
            const btns = document.querySelectorAll('#sp-timer-btn, .fidget-timer-btn');

            if (secs === 0) {
                btns.forEach(b => b.textContent = 'Temporizador');
                showToast('Temporizador desactivado');
                return;
            }

            const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
            btns.forEach(b => b.textContent = fmt(secs));
            showToast(`Límite configurado: ${secs / 60} min`);

            spTimerInterval = setInterval(() => {
                secs -= 1;
                if (secs <= 0) {
                    clearInterval(spTimerInterval);
                    spTimerIdx = 0;
                    btns.forEach(b => b.textContent = 'Temporizador');
                    document.getElementById('soft-timer-banner').classList.remove('hidden');
                } else {
                    btns.forEach(b => b.textContent = fmt(secs));
                }
            }, 1000);
        };

        toggleMasterAudio = function(isOn) {
            if (masterGain && audioCtx) {
                const vol = document.getElementById('player-volume-range').value / 100;
                const targetGain = isOn ? vol * 0.45 : 0.0001;
                masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
                masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), audioCtx.currentTime);
                masterGain.gain.exponentialRampToValueAtTime(targetGain, audioCtx.currentTime + 0.65);
            }
            showToast(isOn ? 'Sonido activado' : 'Sonido silenciado suavemente');
        };

        /* HU-001 + HU-032: MODO CRISIS S.O.S Y VALIDACIÓN DE CONTACTO DE 9 DÍGITOS */
        savePersonalContact = function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-contact-name').value.trim();
            const phone = document.getElementById('edit-contact-phone').value.trim();
            const digitsOnly = phone.replace(/\D/g, '');

            if (!name || digitsOnly.length < 9) {
                showToast('Ingrese un número válido de al menos 9 dígitos');
                return;
            }

            personalContact.name = name;
            personalContact.phone = phone;
            personalContact.relation = document.getElementById('edit-contact-relation').value.trim() || 'Persona de confianza';
            saveStateToStorage();
            renderPersonalContact();
            syncSosContactButton();
            toggleEditContact(false);
            showToast('Contacto personal guardado');
        };

        function syncSosContactButton() {
            const cleanPhone = personalContact.phone.replace(/\s+/g, '');
            const btn = document.getElementById('sos-call-contact-btn');
            const txt = document.getElementById('sos-call-contact-text');
            if (btn) btn.href = 'tel:' + cleanPhone;
            if (txt) txt.textContent = `Llamar a ${personalContact.name}`;
        }

        let sosBreathTimer = null;
        function openSosView() {
            if (isSoundPlaying) {
                stopAudioEngine();
                isSoundPlaying = false;
                updateSoundUI();
            }
            syncSosContactButton();
            hideMainViews();
            document.getElementById('view-sos').classList.remove('hidden');

            const orb = document.getElementById('sos-breath-orb');
            const lbl = document.getElementById('sos-breath-label');
            const secEl = document.getElementById('sos-breath-sec');
            const steps = [
                { label: 'Inhala', sec: 4, scale: 1.16 },
                { label: 'Mantén', sec: 4, scale: 1.16 },
                { label: 'Exhala', sec: 6, scale: 0.88 }
            ];
            let idx = 0;
            let rem = steps[0].sec;

            const applySosStep = () => {
                const st = steps[idx];
                lbl.textContent = st.label;
                secEl.textContent = `${rem} s`;
                orb.style.transitionDuration = `${st.sec}s`;
                orb.style.transform = `scale(${st.scale})`;
            };
            applySosStep();

            clearInterval(sosBreathTimer);
            sosBreathTimer = setInterval(() => {
                rem -= 1;
                if (rem <= 0) {
                    idx = (idx + 1) % steps.length;
                    rem = steps[idx].sec;
                    applySosStep();
                } else {
                    secEl.textContent = `${rem} s`;
                }
            }, 1000);
        }

        function closeSosView() {
            clearInterval(sosBreathTimer);
            showAppTab('dashboard');
            showToast('Modo S.O.S finalizado');
        }

        /* HU-035: FIDGET VISUAL GEOMÉTRICO */
        let geoSlow = false;
        function openGeoView() {
            hideMainViews();
            document.getElementById('view-geo').classList.remove('hidden');
            syncFavoritesUI();
        }
        function toggleGeoSpeed() {
            geoSlow = !geoSlow;
            document.getElementById('geo-mandala').classList.toggle('slow', geoSlow);
            document.getElementById('geo-speed-btn').textContent = `Velocidad: ${geoSlow ? 'Lenta' : 'Normal'}`;
        }
        function resetGeoView() {
            geoSlow = false;
            document.getElementById('geo-mandala').classList.remove('slow');
            document.getElementById('geo-speed-btn').textContent = 'Velocidad: Normal';
            showToast('Geométrico reiniciado');
        }

        /* HU-038: HERRAMIENTA DE DIBUJO LIBRE */
        let drawBound = false;
        let isDrawing = false;

        function resizeDrawCanvas() {
            const canvas = document.getElementById('draw-canvas');
            const stage = document.getElementById('draw-stage');
            if (!canvas || !stage) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = stage.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#5a8fd4';
            ctx.lineWidth = 4;
        }

        function bindDrawCanvas() {
            if (drawBound) return;
            const canvas = document.getElementById('draw-canvas');
            if (!canvas) return;
            drawBound = true;
            const ctx = canvas.getContext('2d');

            const getPos = e => {
                const rect = canvas.getBoundingClientRect();
                return { x: e.clientX - rect.left, y: e.clientY - rect.top };
            };

            canvas.addEventListener('pointerdown', e => {
                isDrawing = true;
                const p = getPos(e);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
            });
            canvas.addEventListener('pointermove', e => {
                if (!isDrawing) return;
                const p = getPos(e);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            });
            window.addEventListener('pointerup', () => { isDrawing = false; });
        }

        function openDrawView() {
            bindDrawCanvas();
            hideMainViews();
            document.getElementById('view-draw').classList.remove('hidden');
            resizeDrawCanvas();
        }

        function clearDrawCanvas() {
            const canvas = document.getElementById('draw-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            showToast('Lienzo limpio');
        }

        // Conectar Geométrico en el catálogo
        openFidgetByKey = function(key) {
            if (key === 'spinner') openSpinnerView();
            else if (key === 'popit') openPopitView();
            else if (key === 'ondas') openOndasView();
            else if (key === 'cube') openCubeView();
            else if (key === 'geo') openGeoView();
            else openDrawView();
        };

        /* HU-031: FOCUS MODE */
        let focusSelectedMins = 25;
        let focusRemainingSecs = 25 * 60;
        let focusPaused = false;
        let focusIntervalId = null;

        function selectFocusMinutes(mins, btnEl) {
            focusSelectedMins = mins;
            document.querySelectorAll('#focus-presets .focus-preset-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
        }

        function updateFocusClockUI() {
            const mm = String(Math.floor(focusRemainingSecs / 60)).padStart(2, '0');
            const ss = String(focusRemainingSecs % 60).padStart(2, '0');
            document.getElementById('focus-clock-display').textContent = `${mm}:${ss}`;
        }

        function startFocusMode() {
            focusRemainingSecs = focusSelectedMins * 60;
            focusPaused = false;
            document.getElementById('btn-focus-pause').textContent = 'Pausar';
            updateFocusClockUI();
            document.getElementById('focus-active-overlay').classList.remove('hidden');

            clearInterval(focusIntervalId);
            focusIntervalId = setInterval(() => {
                if (focusPaused) return;
                focusRemainingSecs -= 1;
                if (focusRemainingSecs <= 0) {
                    clearInterval(focusIntervalId);
                    exitFocusMode();
                    showToast('¡Bloque de concentración completado!');
                } else {
                    updateFocusClockUI();
                }
            }, 1000);
        }

        function toggleFocusPause() {
            focusPaused = !focusPaused;
            document.getElementById('btn-focus-pause').textContent = focusPaused ? 'Reanudar' : 'Pausar';
        }

        function exitFocusMode() {
            clearInterval(focusIntervalId);
            document.getElementById('focus-active-overlay').classList.add('hidden');
        }

        /* HU-027: ANCLAJE SENSORIAL 5-4-3-2-1 */
        const groundingSteps = [
            { num: '5', title: '5 cosas que puedes ver', desc: 'Mira alrededor con calma e identifica cinco objetos, formas o colores cercanos a ti.' },
            { num: '4', title: '4 cosas que puedes tocar', desc: 'Nota cuatro texturas físicas: la ropa, la mesa, tus manos o el respaldo de la silla.' },
            { num: '3', title: '3 cosas que puedes oír', desc: 'Escucha tres sonidos suaves del entorno, cercanos o lejanos, sin juzgarlos.' },
            { num: '2', title: '2 cosas que puedes oler', desc: 'Percibe dos aromas presentes en el ambiente o respira aire fresco.' },
            { num: '1', title: '1 cosa que puedes saborear', desc: 'Enfócate en una sensación agradable o toma un sorbo de agua con calma.' }
        ];
        let groundingIdx = 0;

        function renderGroundingStep() {
            const st = groundingSteps[groundingIdx];
            document.getElementById('grounding-step-num').textContent = st.num;
            document.getElementById('grounding-step-title').textContent = st.title;
            document.getElementById('grounding-step-desc').textContent = st.desc;
            document.getElementById('grounding-next-btn').textContent = groundingIdx === groundingSteps.length - 1 ? 'Finalizar' : 'Completado, siguiente';
            document.getElementById('grounding-dots').innerHTML = groundingSteps.map((_, i) =>
                `<span class="grounding-dot ${i === groundingIdx ? 'active' : ''}"></span>`
            ).join('');
        }

        function nextGroundingStep() {
            if (groundingIdx < groundingSteps.length - 1) {
                groundingIdx += 1;
                renderGroundingStep();
            } else {
                groundingIdx = 0;
                renderGroundingStep();
                showAppTab('dashboard');
                showToast('Excelente trabajo. Volviste al presente.');
            }
        }

        renderGroundingStep();
        syncSosContactButton();
        /* SLIME ELÁSTICO INTERACTIVO (HU-002) */
        let slimeRafId = null;
        let slimeBound = false;
        let slimeDragging = false;
        let slimeStretchX = 0;
        let slimeStretchY = 0;
        let slimeVelX = 0;
        let slimeVelY = 0;
        let slimeCount = 0;

        function resizeSlimeCanvas() {
            const canvas = document.getElementById('slime-canvas');
            const stage = document.getElementById('slime-stage');
            if (!canvas || !stage) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = stage.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function startSlimeLoop() {
            if (slimeRafId) cancelAnimationFrame(slimeRafId);
            const canvas = document.getElementById('slime-canvas');
            const ctx = canvas.getContext('2d');

            function draw() {
                const rect = canvas.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;

                if (!slimeDragging) {
                    const forceX = -0.14 * slimeStretchX;
                    const forceY = -0.14 * slimeStretchY;
                    slimeVelX = (slimeVelX + forceX) * 0.84;
                    slimeVelY = (slimeVelY + forceY) * 0.84;
                    slimeStretchX += slimeVelX;
                    slimeStretchY += slimeVelY;
                }

                ctx.clearRect(0, 0, rect.width, rect.height);

                const dist = Math.hypot(slimeStretchX, slimeStretchY);
                const angle = Math.atan2(slimeStretchY, slimeStretchX);
                const rx = 105 + dist * 0.55;
                const ry = Math.max(62, 105 - dist * 0.22);

                ctx.save();
                ctx.translate(cx + slimeStretchX * 0.45, cy + slimeStretchY * 0.45);
                ctx.rotate(angle);

                const grad = ctx.createRadialGradient(-rx * 0.25, -ry * 0.25, 16, 0, 0, rx);
                grad.addColorStop(0, '#9ac9a6');
                grad.addColorStop(0.65, '#689e78');
                grad.addColorStop(1, '#4d805d');

                ctx.beginPath();
                ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.shadowColor = 'rgba(42, 84, 56, 0.2)';
                ctx.shadowBlur = 24;
                ctx.shadowOffsetY = 12;
                ctx.fill();
                ctx.restore();

                slimeRafId = requestAnimationFrame(draw);
            }

            slimeRafId = requestAnimationFrame(draw);
        }

        function bindSlimeEvents() {
            if (slimeBound) return;
            const stage = document.getElementById('slime-stage');
            if (!stage) return;
            slimeBound = true;

            let startX = 0;
            let startY = 0;

            stage.addEventListener('pointerdown', e => {
                e.preventDefault();
                slimeDragging = true;
                startX = e.clientX - slimeStretchX;
                startY = e.clientY - slimeStretchY;
            });

            window.addEventListener('pointermove', e => {
                if (!slimeDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const dist = Math.hypot(dx, dy);
                const maxStretch = 190;
                if (dist > maxStretch) {
                    const ang = Math.atan2(dy, dx);
                    slimeStretchX = Math.cos(ang) * maxStretch;
                    slimeStretchY = Math.sin(ang) * maxStretch;
                } else {
                    slimeStretchX = dx;
                    slimeStretchY = dy;
                }
            });

            window.addEventListener('pointerup', () => {
                if (!slimeDragging) return;
                slimeDragging = false;
                if (Math.hypot(slimeStretchX, slimeStretchY) > 18) {
                    slimeCount += 1;
                    document.getElementById('slime-counter').textContent = `${slimeCount} estiramientos`;
                    playSoftTone(260, 0.14, 0.04, 'sine');
                }
            });
        }

        function resetSlime() {
            slimeStretchX = 0;
            slimeStretchY = 0;
            slimeVelX = 0;
            slimeVelY = 0;
            slimeCount = 0;
            document.getElementById('slime-counter').textContent = '0 estiramientos';
            showToast('Slime reiniciado');
        }

        function openSlimeView() {
            bindSlimeEvents();
            hideMainViews();
            document.getElementById('view-slime').classList.remove('hidden');
            requestAnimationFrame(() => {
                resizeSlimeCanvas();
                startSlimeLoop();
            });
            syncFavoritesUI();
        }

        const prevCloseFidget = closeFidgetView;
        closeFidgetView = function() {
            cancelAnimationFrame(slimeRafId);
            slimeRafId = null;
            prevCloseFidget();
        };

        openFidgetByKey = function(key) {
            if (key === 'spinner') openSpinnerView();
            else if (key === 'popit') openPopitView();
            else if (key === 'ondas') openOndasView();
            else if (key === 'cube') openCubeView();
            else if (key === 'geo') openGeoView();
            else if (key === 'slime') openSlimeView();
            else openDrawView();
        };

        /* FILTROS POR CATEGORÍA + BÚSQUEDA + VISTA PREVIA EN LAS 3 PESTAÑAS */
        const catalogState = {
            '#tab-all':        { category: 'Todos', search: '', selectedKey: null },
            '#tab-favorites':  { category: 'Todos', search: '', selectedKey: null },
            '#tab-calm-games': { category: 'Todos', search: '', selectedKey: null }
        };

        function updateSidePreviewPanel(containerSelector, key) {
            const meta = fidgetCatalogMeta[key];
            const container = document.querySelector(containerSelector);
            if (!meta || !container) return;

            if (catalogState[containerSelector]) {
                catalogState[containerSelector].selectedKey = key;
            }

            container.querySelectorAll('.list-card').forEach(card => {
                card.classList.remove('active');
                const t = card.querySelector('.fc-title');
                const cardKey = t ? titleToFidgetKey[t.textContent.trim()] : '';
                card.classList.toggle('selected-preview', cardKey === key);
            });

            const previewBox = container.querySelector('.preview-panel');
            if (!previewBox) return;

            const imgBox = previewBox.querySelector('.preview-image');
            if (imgBox) {
                imgBox.className = `preview-image ${meta.bg}`;
                imgBox.innerHTML = meta.art;
            }
            const catEl = previewBox.querySelector('.fc-eyebrow');
            if (catEl) catEl.textContent = meta.cat;

            const titleEl = previewBox.querySelector('h3');
            if (titleEl) titleEl.textContent = meta.title;

            const descEl = previewBox.querySelector('p');
            if (descEl) descEl.textContent = meta.desc;

            const openBtn = previewBox.querySelector('.preview-btn');
            if (openBtn) {
                openBtn.textContent = `Abrir ${meta.title} ↗`;
                openBtn.onclick = () => openFidgetByKey(key);
            }
        }

        function applyCatalogFilter(tabSelector) {
            const tab = document.querySelector(tabSelector);
            const state = catalogState[tabSelector];
            if (!tab || !state) return;
            const grid = tab.querySelector('.grid-2-cols');
            if (!grid) return;

            const cards = Array.from(grid.querySelectorAll('.list-card'));
            let visibleCount = 0;

            cards.forEach(card => {
                const catEl = card.querySelector('.fc-eyebrow');
                const titleEl = card.querySelector('.fc-title');
                const descEl = card.querySelector('.fc-desc');
                const catText = catEl ? catEl.textContent.trim().toUpperCase() : '';
                const fullText = `${titleEl ? titleEl.textContent : ''} ${descEl ? descEl.textContent : ''} ${catText}`.toLowerCase();

                const matchesCat = (state.category === 'Todos') || (catText === state.category.toUpperCase());
                const matchesSearch = !state.search || fullText.includes(state.search);

                const show = matchesCat && matchesSearch;
                card.style.display = show ? 'flex' : 'none';
                if (show) visibleCount += 1;
            });

            const headerCount = tab.querySelector('.list-header');
            if (headerCount) {
                headerCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'fidget' : 'fidgets'} para explorar`;
            }
        }

        function bindCardsInContainer(tabSelector) {
            const container = document.querySelector(tabSelector);
            if (!container) return;

            container.querySelectorAll('.list-card').forEach(card => {
                card.classList.remove('active');
                const titleEl = card.querySelector('.fc-title');
                const key = titleEl ? titleToFidgetKey[titleEl.textContent.trim()] : '';
                if (!key) return;

                card.classList.toggle('selected-preview', catalogState[tabSelector]?.selectedKey === key);

                card.onclick = e => {
                    if (e.target.closest('.fc-heart') || e.target.closest('.fc-link')) return;
                    updateSidePreviewPanel(tabSelector, key);
                };

                const linkEl = card.querySelector('.fc-link');
                if (linkEl) {
                    linkEl.onclick = e => {
                        e.preventDefault();
                        e.stopPropagation();
                        openFidgetByKey(key);
                    };
                }
            });
        }

        // Asegurar que Favoritos conserve el clic de vista previa y filtros al agregar/quitar corazones
        const originalSyncFavoritesUI = syncFavoritesUI;
        syncFavoritesUI = function() {
            originalSyncFavoritesUI();
            bindCardsInContainer('#tab-favorites');
            applyCatalogFilter('#tab-favorites');
            const firstFavKey = Array.from(favoriteFidgets)[0];
            if (firstFavKey && !favoriteFidgets.has(catalogState['#tab-favorites'].selectedKey)) {
                updateSidePreviewPanel('#tab-favorites', firstFavKey);
            }
        };

        (function initAllThreeCatalogTabs() {
            ['#tab-all', '#tab-favorites', '#tab-calm-games'].forEach(tabSelector => {
                const tab = document.querySelector(tabSelector);
                if (!tab) return;

                // Filtros por categoría (Todos, Apretar, Estirar, Exclusivos, Rotatorios)
                tab.querySelectorAll('.filter-tag').forEach(btn => {
                    btn.addEventListener('click', () => {
                        tab.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        catalogState[tabSelector].category = btn.textContent.trim();
                        applyCatalogFilter(tabSelector);
                    });
                });

                // Buscador en vivo
                const searchInput = tab.querySelector('.search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', e => {
                        catalogState[tabSelector].search = e.target.value.trim().toLowerCase();
                        applyCatalogFilter(tabSelector);
                    });
                }

                // Selector Ordenar (A-Z / Z-A)
                const sortSelect = tab.querySelector('.sort-select');
                if (sortSelect) {
                    sortSelect.addEventListener('change', e => {
                        const grid = tab.querySelector('.grid-2-cols');
                        const cards = Array.from(grid.querySelectorAll('.list-card'));
                        const desc = e.target.value === 'Z-A';
                        cards.sort((a, b) => {
                            const ta = a.querySelector('.fc-title').textContent.trim();
                            const tb = b.querySelector('.fc-title').textContent.trim();
                            return desc ? tb.localeCompare(ta) : ta.localeCompare(tb);
                        });
                        cards.forEach(c => grid.appendChild(c));
                    });
                }

                bindCardsInContainer(tabSelector);
            });
        })();
        
        loadStateFromStorage();
        syncQuickCheckinCard();
        applyProfileToUI();
        applyPrefsToUI();
        /* FIX DE CONTENEDORES Y ENLACE DE DIBUJO LIBRE */
        (function fixStageThreeViews() {
            const scrollContainer = document.getElementById('app-content-scroll');
            ['tab-focus', 'tab-grounding'].forEach(tabId => {
                const tabEl = document.getElementById(tabId);
                if (tabEl && scrollContainer && tabEl.parentElement !== scrollContainer) {
                    scrollContainer.appendChild(tabEl);
                }
            });

            const drawView = document.getElementById('view-draw');
            if (drawView && drawView.parentElement !== document.body) {
                document.body.appendChild(drawView);
            }

            document.querySelectorAll('#tab-all .shortcut-card').forEach(card => {
                const title = card.querySelector('.shortcut-title');
                if (title && title.textContent.trim() === 'Dibujo libre') {
                    card.style.cursor = 'pointer';
                    card.onclick = () => openDrawView();
                }
            });
        })();

        openDrawView = function() {
            bindDrawCanvas();
            hideMainViews();
            document.getElementById('view-draw').classList.remove('hidden');
            requestAnimationFrame(() => resizeDrawCanvas());
        };
        /* ETAPA 3: MENÚ RESPONSIVE + ACCESIBILIDAD WCAG 2.2 (TECLADO Y ARIA) */
        function toggleMobileSidebar(forceState) {
            const sidebar = document.getElementById('app-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');
            const btn = document.getElementById('mobile-menu-btn');
            if (!sidebar || !backdrop) return;

            const willOpen = (typeof forceState === 'boolean') ? forceState : !sidebar.classList.contains('open');
            sidebar.classList.toggle('open', willOpen);
            backdrop.classList.toggle('show', willOpen);
            if (btn) btn.setAttribute('aria-expanded', String(willOpen));
        }

        // Cerrar automáticamente el menú lateral móvil al elegir una pestaña
        const prevShowAppTab = showAppTab;
        showAppTab = function(tabKey) {
            toggleMobileSidebar(false);
            prevShowAppTab(tabKey);
        };

        // Hacer navegables con teclado (Tab + Enter/Espacio) las tarjetas y selectores interactivos
        function enhanceKeyboardAccessibility() {
            const interactiveSelectors = '.mood-option, .shortcut-card, .fidget-card, .list-card, .fc-heart, .footer-links span';
            document.querySelectorAll(interactiveSelectors).forEach(el => {
                if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
                if (!el.hasAttribute('role')) el.setAttribute('role', 'button');

                if (!el.dataset.kbdBound) {
                    el.dataset.kbdBound = '1';
                    el.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            el.click();
                        }
                    });
                }
            });

            // Etiquetas aria descriptivas en corazones
            document.querySelectorAll('.fc-heart').forEach(h => {
                const title = h.closest('.fidget-card, .list-card')?.querySelector('.fc-title')?.textContent?.trim() || 'fidget';
                h.setAttribute('aria-label', `Marcar ${title} como favorito`);
            });
        }

        // Tecla Escape cierra modales, menú móvil, Focus Mode o vistas de fidget
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            toggleMobileSidebar(false);
            closeAllModals();
            const focusOv = document.getElementById('focus-active-overlay');
            if (focusOv && !focusOv.classList.contains('hidden')) exitFocusMode();
        });

        const prevSyncFavA11y = syncFavoritesUI;
        syncFavoritesUI = function() {
            prevSyncFavA11y();
            enhanceKeyboardAccessibility();
        };

        enhanceKeyboardAccessibility();
        lucide.createIcons();

        /* REINICIO AUTOMÁTICO DE SCROLL AL CAMBIAR DE VISTA O ABRIR UN FIDGET */
function resetViewportScroll() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('.view').forEach(v => { v.scrollTop = 0; });
    const sc = document.getElementById('app-content-scroll');
    if (sc) sc.scrollTop = 0;
    requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('.view').forEach(v => { v.scrollTop = 0; });
    });
}

['hideMainViews', 'showWelcomeView', 'showLoginView', 'showAppTab', 'closeSpinnerView', 'closeFidgetView', 'openSosView', 'closeSosView'].forEach(fnName => {
    if (typeof window[fnName] === 'function') {
        const originalFn = window[fnName];
        window[fnName] = function(...args) {
            const res = originalFn.apply(this, args);
            resetViewportScroll();
            return res;
        };
    }
});
