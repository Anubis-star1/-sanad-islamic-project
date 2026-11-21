// js/voice-engine.js
class ArabicVoiceEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
    this.arabicVoice = null;
    this.isEnabled = true;
    this.hoverTimer = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.arabicVoice =
      voices.find(v => v.lang.includes('ar') && (v.name.includes('Natural') || v.name.includes('Salma') || v.name.includes('Shakir') || v.name.includes('Hoda'))) ||
      voices.find(v => v.lang.includes('ar-EG')) ||
      voices.find(v => v.lang.includes('ar'));
  }

  cleanText(text) {
    if (!text) return '';
    // إزالة أي إيموجيز أو رموز تصويرية قبل النطق الصوتي
    return text
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(text, interrupt = true) {
    const clean = this.cleanText(text);
    if (!this.synth || !this.isEnabled || !clean) return;

    if (interrupt) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-EG';
    if (this.arabicVoice) utterance.voice = this.arabicVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    this.synth.speak(utterance);
  }

  stop() {
    if (!this.synth) return;
    this.synth.cancel();
  }

  bindAutoReadElements() {
    const readableElements = document.querySelectorAll('[data-speak], button, a, h1, h2, h3');
    readableElements.forEach(el => {
      const getTextToSpeak = () => el.getAttribute('data-speak') || el.innerText.trim();

      el.addEventListener('mouseenter', () => {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
          this.speak(getTextToSpeak(), true);
        }, 350);
      });

      el.addEventListener('mouseleave', () => {
        clearTimeout(this.hoverTimer);
      });

      el.addEventListener('focus', () => {
        this.speak(getTextToSpeak(), true);
      });
    });
  }
}

window.voiceEngine = new ArabicVoiceEngine();
