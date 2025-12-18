// Sistema de Som Mr. Robot - Simplificado e Funcional
class MrRobotSoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.soundType = 'terminal'; // terminal, mechanical, retro
        this.initialized = false;
        this.ambientSound = null;
        
        this.init();
    }
    
    init() {
        // Carregar configurações salvas
        this.loadSettings();
        
        // Configurar botão de som
        this.setupSoundButton();
        
        // Configurar atalhos de teclado
        this.setupKeyboardShortcuts();
        
        // Configurar eventos de clique para inicializar áudio
        this.setupAudioInitialization();
        
        // Configurar sons nos elementos
        this.setupSoundEvents();
        
        // Atualizar UI
        this.updateUI();
        
        console.log('🔊 Sistema de som inicializado');
    }
    
    loadSettings() {
        const savedEnabled = localStorage.getItem('mrRobotSoundEnabled');
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }
        
        const savedType = localStorage.getItem('mrRobotSoundType');
        if (savedType && ['terminal', 'mechanical', 'retro'].includes(savedType)) {
            this.soundType = savedType;
        }
    }
    
    saveSettings() {
        localStorage.setItem('mrRobotSoundEnabled', this.enabled);
        localStorage.setItem('mrRobotSoundType', this.soundType);
    }
    
    setupSoundButton() {
        const soundBtn = document.getElementById('toggleSound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }
    }
    
    setupAudioInitialization() {
        // Inicializar áudio no primeiro clique do usuário
        const initAudio = () => {
            if (!this.initialized) {
                this.initAudioContext();
                this.initialized = true;
                document.removeEventListener('click', initAudio);
            }
        };
        
        document.addEventListener('click', initAudio);
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Contexto de áudio criado');
        } catch (error) {
            console.error('❌ Erro ao criar contexto de áudio:', error);
        }
    }
    
    playSound(action = 'click') {
        if (!this.enabled || !this.audioContext || this.audioContext.state === 'suspended') {
            return;
        }
        
        try {
            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Configurar baseado no tipo e ação
            const config = this.getSoundConfig(action);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Frequência com pequena variação para parecer mais natural
            const freq = config.frequency * (0.95 + Math.random() * 0.1);
            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = config.waveType;
            
            // Envelope ADSR simples
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(config.volume, now + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
            
            oscillator.start(now);
            oscillator.stop(now + config.duration);
            
        } catch (error) {
            console.log('Erro ao tocar som:', error);
        }
    }
    
    getSoundConfig(action) {
        const configs = {
            terminal: {
                click: { frequency: 1200, waveType: 'sine', duration: 0.08, volume: 0.15 },
                hover: { frequency: 800, waveType: 'sine', duration: 0.04, volume: 0.08 },
                enter: { frequency: 600, waveType: 'square', duration: 0.12, volume: 0.2 }
            },
            mechanical: {
                click: { frequency: 150, waveType: 'square', duration: 0.1, volume: 0.15 },
                hover: { frequency: 100, waveType: 'square', duration: 0.05, volume: 0.08 },
                enter: { frequency: 200, waveType: 'sawtooth', duration: 0.15, volume: 0.2 }
            },
            retro: {
                click: { frequency: 1000, waveType: 'triangle', duration: 0.07, volume: 0.15 },
                hover: { frequency: 700, waveType: 'triangle', duration: 0.03, volume: 0.08 },
                enter: { frequency: 500, waveType: 'square', duration: 0.1, volume: 0.2 }
            }
        };
        
        return configs[this.soundType][action] || configs[this.soundType].click;
    }
    
    toggleSound() {
        this.enabled = !this.enabled;
        this.saveSettings();
        
        if (this.enabled) {
            if (!this.audioContext) {
                this.initAudioContext();
            } else if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.showNotification('SOM ATIVADO', '#00ff00');
            this.playSound('enter');
        } else {
            this.showNotification('SOM DESATIVADO', '#ff0033');
        }
        
        this.updateUI();
    }
    
    changeSoundType(type) {
        if (!['terminal', 'mechanical', 'retro'].includes(type)) return;
        
        this.soundType = type;
        this.saveSettings();
        
        const typeNames = {
            terminal: 'TERMINAL',
            mechanical: 'MECÂNICO', 
            retro: 'RETRO'
        };
        
        this.showNotification(`TIPO: ${typeNames[type]}`, '#00a8ff');
        this.playSound('enter'); // Som de confirmação
        
        this.updateUI();
    }
    
    showNotification(text, color) {
        // Remover notificação anterior
        const oldNotif = document.querySelector('.sound-notification');
        if (oldNotif) oldNotif.remove();
        
        // Criar nova notificação
        const notif = document.createElement('div');
        notif.className = 'sound-notification';
        notif.textContent = text;
        notif.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            color: ${color};
            padding: 10px 20px;
            font-family: 'Roboto Mono', monospace;
            font-weight: bold;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s;
        `;
        document.body.appendChild(notif);
        
        // Animar entrada
        setTimeout(() => {
            notif.style.opacity = '1';
            notif.style.transform = 'translateX(0)';
        }, 10);
        
        // Remover após 2 segundos
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(100px)';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
    
    updateUI() {
        const soundBtn = document.getElementById('toggleSound');
        if (soundBtn) {
            const icon = soundBtn.querySelector('i');
            if (icon) {
                icon.className = this.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
                soundBtn.title = this.enabled ? 'Desativar som (Ctrl+M)' : 'Ativar som (Ctrl+M)';
            }
        }
        
        // Atualizar botões de tipo se existirem
        document.querySelectorAll('[data-sound-type]').forEach(btn => {
            if (btn.dataset.soundType === this.soundType) {
                btn.style.opacity = '1';
                btn.style.borderWidth = '2px';
            } else {
                btn.style.opacity = '0.6';
                btn.style.borderWidth = '1px';
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+M - Mute/Unmute
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.toggleSound();
            }
            
            // Ctrl+1 - Terminal
            if (e.ctrlKey && e.key === '1') {
                e.preventDefault();
                this.changeSoundType('terminal');
            }
            
            // Ctrl+2 - Mechanical
            if (e.ctrlKey && e.key === '2') {
                e.preventDefault();
                this.changeSoundType('mechanical');
            }
            
            // Ctrl+3 - Retro
            if (e.ctrlKey && e.key === '3') {
                e.preventDefault();
                this.changeSoundType('retro');
            }
        });
    }
    
    setupSoundEvents() {
        // Sons em elementos com data-sound
        document.addEventListener('click', (e) => {
            const element = e.target.closest('[data-sound]');
            if (element && this.enabled) {
                const soundAction = element.dataset.sound;
                this.playSound(soundAction);
            }
        });
        
        // Sons em hover (com debounce)
        let hoverTimer;
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-sound]');
            if (element && this.enabled) {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    if (element.dataset.sound !== 'enter') {
                        this.playSound('hover');
                    }
                }, 100);
            }
        });
        
        // Sons específicos para cards
        let lastHover = 0;
        document.querySelectorAll('.character-card, .episode-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.enabled) return;
                const now = Date.now();
                if (now - lastHover > 300) {
                    this.playSound('hover');
                    lastHover = now;
                }
            });
        });
    }
}

// Inicialização
let soundSystem;

document.addEventListener('DOMContentLoaded', () => {
    soundSystem = new MrRobotSoundSystem();
    window.soundSystem = soundSystem;
    
    // Adicionar botões de tipo de som se não existirem
    if (!document.querySelector('.sound-type-buttons')) {
        addSoundTypeButtons();
    }
    
    // Configurar efeitos visuais
    setupVisualEffects();
});

function addSoundTypeButtons() {
    const soundControls = document.createElement('div');
    soundControls.className = 'sound-type-buttons';
    soundControls.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        display: flex;
        gap: 10px;
        z-index: 9999;
        opacity: 0.7;
        transition: opacity 0.3s;
    `;
    
    soundControls.innerHTML = `
        <button data-sound-type="terminal" style="
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 8px 12px;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.8rem;
            cursor: pointer;
        ">Terminal</button>
        
        <button data-sound-type="mechanical" style="
            background: rgba(255, 255, 0, 0.1);
            border: 1px solid #ffff00;
            color: #ffff00;
            padding: 8px 12px;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.8rem;
            cursor: pointer;
        ">Mecânico</button>
        
        <button data-sound-type="retro" style="
            background: rgba(0, 168, 255, 0.1);
            border: 1px solid #00a8ff;
            color: #00a8ff;
            padding: 8px 12px;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.8rem;
            cursor: pointer;
        ">Retro</button>
    `;
    
    document.body.appendChild(soundControls);
    
    // Eventos dos botões
    soundControls.addEventListener('mouseenter', () => {
        soundControls.style.opacity = '1';
    });
    
    soundControls.addEventListener('mouseleave', () => {
        soundControls.style.opacity = '0.7';
    });
    
    soundControls.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            soundSystem.changeSoundType(btn.dataset.soundType);
        });
    });
}

function setupVisualEffects() {
    // Efeitos nos cards
    document.querySelectorAll('.character-card, .episode-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const overlay = card.querySelector('.card-overlay, .episode-overlay');
            if (overlay) {
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const overlay = card.querySelector('.card-overlay, .episode-overlay');
            if (overlay) {
                overlay.style.backgroundColor = '';
            }
        });
    });
    
    // Efeitos nos botões
    document.querySelectorAll('.btn-terminal-sm, .btn-hacker').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// Função para teste rápido
function testSound() {
    if (window.soundSystem) {
        window.soundSystem.playSound('enter');
    }
}

// Adicionar botão de teste
const testBtn = document.createElement('button');
testBtn.textContent = '🔊';
testBtn.title = 'Testar som';
testBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10000;
    font-size: 1.2rem;
`;
testBtn.addEventListener('click', testSound);
document.body.appendChild(testBtn);