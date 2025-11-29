import { useState, useEffect, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeDown, FaCog, FaQuestionCircle } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import VoiceHelpGuide from './VoiceHelpGuide';
import './VoiceControls.css';

interface VoiceControlsProps {
  onTextReceived: (text: string) => void;
  isTyping: boolean;
  currentMessage: string | null;
}

const VoiceControlsEnhanced: React.FC<VoiceControlsProps> = ({ onTextReceived, isTyping, currentMessage }) => {
  // Stati per la sintesi vocale
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  
  // Stato per il supporto Electron
  const [electronSpeechSupport, setElectronSpeechSupport] = useState<boolean>(false);
  
  // Stato per la guida vocale
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);
  
  // Utilizza il hook di riconoscimento vocale
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  // Oggetto di riconoscimento vocale nativo
  const [recognition, setRecognition] = useState<any>(null);
  
  // Verifica se siamo in Electron e inizializza il riconoscimento vocale alternativo se necessario
  useEffect(() => {
    // Verifica se siamo in un ambiente Electron
    const isElectron = window.navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    
    // Se siamo in Electron ma il browser non supporta il riconoscimento vocale standard,
    // proviamo a utilizzare soluzioni alternative
    if (isElectron && !browserSupportsSpeechRecognition) {
      console.log("Tentativo di utilizzare il supporto vocale alternativo per Electron");
      setElectronSpeechSupport(true);
      
      // Qui potremmo attivare un approccio alternativo se browser non supporta quello standard
      // Per esempio, usando una libreria nativa tramite preload
    }
  }, [browserSupportsSpeechRecognition]);

  // Richiedi l'accesso al microfono all'avvio
  useEffect(() => {
    // Verifica se siamo in Electron
    if ((window as any).electronSpeechAPI) {
      console.log("Inizializzazione dell'accesso al microfono in Electron");
      
      // Controlla se il microfono è disponibile
      (window as any).electronSpeechAPI.checkMicrophoneAvailability()
        .then((available: boolean) => {
          if (available) {
            // Richiedi esplicitamente l'accesso
            (window as any).electronSpeechAPI.requestMicrophoneAccess()
              .then((success: boolean) => {
                console.log(`Accesso al microfono in Electron: ${success ? 'consentito' : 'negato'}`);
              });
          } else {
            console.log("Nessun microfono disponibile");
          }
        });
    }
  }, []);

  // FIX ALTA: Memory leak - Inizializzazione delle voci disponibili
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Seleziona una voce italiana se disponibile
      const italianVoice = availableVoices.find(voice => voice.lang.includes('it'));
      if (italianVoice) {
        setSelectedVoice(italianVoice.name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    if (window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }

    // FIX: Pulizia quando il componente viene smontato
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        // Rimuovi listener per prevenire memory leak
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
  }, []);

  // Monitora il transcript per inviare il testo quando arriva
  useEffect(() => {
    console.log('[VoiceControlsEnhanced] transcript:', transcript);
    if (transcript && transcript.trim().length > 0) {
      onTextReceived(transcript);
      // Reset del transcript dopo l'invio
      resetTranscript();
    }
  }, [transcript, onTextReceived, resetTranscript]);

  // Monitora lo stato del riconoscimento vocale
  useEffect(() => {
    console.log(`Stato riconoscimento vocale: ${listening ? 'attivo' : 'inattivo'}`);
    console.log(`Browser supporta riconoscimento vocale: ${browserSupportsSpeechRecognition}`);
    
    // Verifica se il riconoscimento vocale è supportato ma non funziona
    if (browserSupportsSpeechRecognition && !listening) {
      // Log delle informazioni del browser per debug
      console.log('User Agent:', navigator.userAgent);
      console.log('Preferenze lingua:', navigator.languages);
      
      // Controlla le API disponibili
      const hasSpeechRecognition = 'SpeechRecognition' in window;
      const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
      console.log('SpeechRecognition disponibile:', hasSpeechRecognition);
      console.log('webkitSpeechRecognition disponibile:', hasWebkitSpeechRecognition);
    }
  }, [listening, browserSupportsSpeechRecognition]);
  
  // Gestisce l'avvio e l'arresto del riconoscimento vocale
  const toggleListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition && !electronSpeechSupport) {
      // Tentiamo di accedere al microfono tramite l'API Electron
      if ((window as any).electronSpeechAPI) {
        (window as any).electronSpeechAPI.requestMicrophoneAccess()
          .then((success: boolean) => {
            if (success) {
              alert('Accesso al microfono consentito. Riprova a usare la funzione vocale.');
              // Tenta di riavviare la libreria di riconoscimento vocale
              SpeechRecognition.startListening({ language: 'it-IT', continuous: true });
            } else {
              alert('Non è stato possibile ottenere l\'accesso al microfono. Verifica che il microfono sia connesso e che le autorizzazioni siano corrette nelle impostazioni del sistema.');
              
              // Mostra suggerimenti di risoluzione dei problemi
              const suggerimenti = 
                "Suggerimenti per risolvere i problemi di microfono:\n\n" +
                "1. Verifica che il microfono sia collegato e funzionante\n" +
                "2. Controlla le autorizzazioni del microfono nelle impostazioni di Windows\n" +
                "3. Prova a riavviare l'applicazione\n" +
                "4. Se usi un microfono esterno, prova a scollegarlo e ricollegarlo\n" +
                "5. Verifica che il microfono non sia in uso da un'altra applicazione";
              
              console.log(suggerimenti);
            }
          });
      } else {
        alert('Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome, Edge o Safari.');
      }
      return;
    }
    
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ language: 'it-IT', continuous: true });
    }
  }, [listening, browserSupportsSpeechRecognition, electronSpeechSupport]);

  // Funzione per leggere il messaggio corrente
  const speakMessage = useCallback(() => {
    if (!currentMessage || isSpeaking || isTyping) return;
    
    const utterance = new SpeechSynthesisUtterance(currentMessage);
    
    // Trova la voce selezionata
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [currentMessage, isSpeaking, isTyping, selectedVoice, voices, speechRate, speechPitch]);

  // Ferma la lettura quando è in corso
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);
  
  // Aggiorna il valore della voce selezionata
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
  };
  
  // Funzione di debug per testare l'accesso al microfono
  const testMicrophoneAccess = useCallback(async () => {
    try {
      console.log("Tentativo di accesso al microfono...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Accesso al microfono ottenuto:", stream);
      // Mostra le tracce audio disponibili
      const tracks = stream.getAudioTracks();
      console.log("Tracce audio disponibili:", tracks.map(t => ({ 
        label: t.label, 
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));
      
      // Rilascia lo stream dopo il test
      stream.getTracks().forEach(track => track.stop());
      
      alert("Test microfono superato! Il microfono è accessibile.");
      return true;
    } catch (error: any) {
      console.error("Errore nell'accesso al microfono durante il test:", error);
      alert(`Test microfono fallito: ${error.message || 'Errore sconosciuto'}`);
      return false;
    }
  }, []);

  // Mostra un messaggio se il riconoscimento vocale non è supportato e non siamo in Electron
  if (!browserSupportsSpeechRecognition && !electronSpeechSupport) {
    return (
      <div className="voice-controls">
        <span className="voice-status">Riconoscimento vocale non supportato dal browser</span>
        <button 
          className="voice-button"
          onClick={() => alert("Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome, Edge o Safari.")}
          aria-label="Informazioni sul riconoscimento vocale"
        >
          <span className="tooltip">Informazioni</span>
          <FaMicrophone size={20} />
        </button>
      </div>
    );
  }
  return (
    <>
      {showHelpGuide && <VoiceHelpGuide onClose={() => setShowHelpGuide(false)} />}
      
      <div className="voice-controls">
        {listening && (
          <div className="voice-status-indicator listening">
            Ascolto in corso...
          </div>
        )}
        {isSpeaking && (
          <div className="voice-status-indicator speaking">
            Lettura in corso...
          </div>
        )}
        <button 
          className={`voice-button prominent ${listening ? 'active listening' : ''}`}
          onClick={toggleListening}
          aria-label={listening ? 'Interrompi registrazione' : 'Inizia registrazione'}
        >
          <span className="tooltip">{listening ? 'Interrompi ascolto' : 'Attiva microfono'}</span>
          {listening ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
        </button>
        
        <button 
          className={`voice-button ${isSpeaking ? 'active speaking' : ''}`}
          onClick={isSpeaking ? stopSpeaking : speakMessage}
          disabled={isTyping || !currentMessage}
          aria-label={isSpeaking ? 'Interrompi lettura' : 'Leggi messaggio'}
        >
          <span className="tooltip">{isSpeaking ? 'Interrompi lettura' : 'Leggi messaggio'}</span>
          {isSpeaking ? <FaVolumeUp size={20} /> : <FaVolumeDown size={20} />}
        </button>
        
        <button 
          className="voice-button"
          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          aria-label="Impostazioni vocali"
        >
          <span className="tooltip">Impostazioni vocali</span>
          <FaCog size={20} />
        </button>
        
        {/* Pulsante di guida */}
        <button 
          className="voice-button"
          onClick={() => setShowHelpGuide(true)}
          aria-label="Guida vocale"
        >
          <span className="tooltip">Guida vocale</span>
          <FaQuestionCircle size={20} />
        </button>
        
        {/* Pulsante di test del microfono */}
        <button 
          className="voice-button prominent"
          onClick={testMicrophoneAccess}
          aria-label="Test microfono"
        >
          <span className="tooltip">Test microfono</span>
          <FaMicrophone size={18} />
        </button>
        
        {showVoiceSettings && (
          <div className="voice-settings">
            <label htmlFor="voice-select">Voce:</label>
            <select 
              id="voice-select" 
              value={selectedVoice}
              onChange={handleVoiceChange}
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            
            <label htmlFor="rate-select">Velocità: {speechRate}x</label>
            <input
              id="rate-select"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
            
            <label htmlFor="pitch-select">Tono: {speechPitch}</label>
            <input
              id="pitch-select"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            />
            
            <div className="button-group">
              <button 
                className="voice-settings-button"
                onClick={() => {
                  setSpeechRate(1);
                  setSpeechPitch(1);
                }}
              >
                Reset
              </button>
              <button 
                className="voice-settings-button"
                onClick={() => setShowVoiceSettings(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VoiceControlsEnhanced;
