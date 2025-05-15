
/**
 * Utility per il riconoscimento vocale con supporto nativo
 * e fallback per casi in cui react-speech-recognition non funziona
 */
export class NativeSpeechRecognition {
  private recognition: any;
  private isListening: boolean = false;
  private onResultCallback: (text: string) => void;
  private onStateChangeCallback: (isListening: boolean) => void;
  private language: string;
  
  constructor(options: {
    onResult: (text: string) => void,
    onStateChange: (isListening: boolean) => void,
    language?: string
  }) {
    this.onResultCallback = options.onResult;
    this.onStateChangeCallback = options.onStateChange;
    this.language = options.language || 'it-IT';
    
    this.initRecognition();
  }
  
  /**
   * Inizializza l'oggetto di riconoscimento vocale nativo
   */
  private initRecognition() {
    try {
      // Cerca di utilizzare l'API nativa
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('API di riconoscimento vocale non supportate');
        return;
      }
      
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript.trim()) {
          console.log('Testo riconosciuto:', finalTranscript);
          this.onResultCallback(finalTranscript);
        }
      };
      
      this.recognition.onstart = () => {
        console.log('Riconoscimento vocale avviato');
        this.isListening = true;
        this.onStateChangeCallback(true);
      };
      
      this.recognition.onend = () => {
        console.log('Riconoscimento vocale terminato');
        this.isListening = false;
        this.onStateChangeCallback(false);
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Errore nel riconoscimento vocale:', event.error);
        this.isListening = false;
        this.onStateChangeCallback(false);
      };
      
      console.log('Riconoscimento vocale nativo inizializzato con successo');
    } catch (error) {
      console.error('Errore nell\'inizializzazione del riconoscimento vocale:', error);
    }
  }
  
  /**
   * Avvia il riconoscimento vocale
   */
  public start() {
    if (!this.recognition) {
      console.error('Riconoscimento vocale non disponibile');
      return false;
    }
    
    if (this.isListening) {
      return true; // Già in ascolto
    }
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Errore nell\'avvio del riconoscimento vocale:', error);
      return false;
    }
  }
  
  /**
   * Ferma il riconoscimento vocale
   */
  public stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Errore nell\'arresto del riconoscimento vocale:', error);
    }
  }
  
  /**
   * Controlla se il riconoscimento vocale è disponibile
   */
  public static isAvailable(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
  
  /**
   * Testa l'accesso al microfono
   */
  public static async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Log delle informazioni del microfono
      const tracks = stream.getAudioTracks();
      console.log('Microfono disponibile:', tracks.map(t => ({
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));
      
      // Rilascia lo stream dopo il test
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Errore nel test del microfono:', error);
      return false;
    }
  }
}
