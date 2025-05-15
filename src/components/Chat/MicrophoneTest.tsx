import { useState, useEffect, useCallback } from 'react';
import { NativeSpeechRecognition } from './SpeechRecognitionUtil';
import './VoiceControls.css';
import './MicrophoneTest.css';

const MicrophoneTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    nativeSpeechAvailable: boolean;
    microphoneAccessible: boolean;
    testMessage: string;
    recognizedText: string;
    isListening: boolean;
  }>({
    nativeSpeechAvailable: false,
    microphoneAccessible: false,
    testMessage: 'Clicca su "Testa microfono" per verificare se il microfono è accessibile.',
    recognizedText: '',
    isListening: false
  });
  
  const [recognition, setRecognition] = useState<NativeSpeechRecognition | null>(null);
  
  // Verifica la disponibilità del riconoscimento vocale all'avvio
  useEffect(() => {
    const nativeSpeechAvailable = NativeSpeechRecognition.isAvailable();
    setTestResults(prev => ({
      ...prev,
      nativeSpeechAvailable
    }));
    
    // Inizializza il riconoscimento vocale se disponibile
    if (nativeSpeechAvailable) {
      const recognizer = new NativeSpeechRecognition({
        onResult: (text) => {
          setTestResults(prev => ({
            ...prev,
            recognizedText: text
          }));
        },
        onStateChange: (isListening) => {
          setTestResults(prev => ({
            ...prev,
            isListening
          }));
        }
      });
      
      setRecognition(recognizer);
    }
    
    // Pulizia alla dismissione
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);
  
  // Funzione per testare l'accesso al microfono
  const testMicrophone = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      testMessage: 'Test del microfono in corso...'
    }));
    
    try {
      const hasAccess = await NativeSpeechRecognition.testMicrophone();
      
      setTestResults(prev => ({
        ...prev,
        microphoneAccessible: hasAccess,
        testMessage: hasAccess 
          ? 'Il microfono è accessibile!' 
          : 'Non è stato possibile accedere al microfono. Verifica le autorizzazioni.'
      }));
      
      return hasAccess;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        microphoneAccessible: false,
        testMessage: `Errore durante il test del microfono: ${error}`
      }));
      
      return false;
    }
  }, []);
  
  // Funzione per testare il riconoscimento vocale
  const testSpeechRecognition = useCallback(() => {
    if (!recognition) {
      setTestResults(prev => ({
        ...prev,
        testMessage: 'Il riconoscimento vocale non è disponibile'
      }));
      return;
    }
    
    if (testResults.isListening) {
      recognition.stop();
      setTestResults(prev => ({
        ...prev,
        testMessage: 'Riconoscimento vocale interrotto'
      }));
    } else {
      const started = recognition.start();
      setTestResults(prev => ({
        ...prev,
        testMessage: started 
          ? 'Riconoscimento vocale avviato! Parla ora...' 
          : 'Impossibile avviare il riconoscimento vocale'
      }));
    }
  }, [recognition, testResults.isListening]);
  
  // Genera informazioni di supporto per la diagnostica
  const generateSupportInfo = useCallback(() => {
    // Raccoglie informazioni sul browser e sul sistema
    const supportInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      languages: navigator.languages,
      speechRecognition: {
        nativeAvailable: !!(window as any).SpeechRecognition,
        webkitAvailable: !!(window as any).webkitSpeechRecognition,
        supported: testResults.nativeSpeechAvailable
      },
      audioContext: {
        available: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
      },
      mediaDevices: {
        available: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        enumerateDevices: !!navigator.mediaDevices?.enumerateDevices
      },
      microphoneAccessible: testResults.microphoneAccessible
    };
    
    // Formatta le informazioni
    const infoText = `Informazioni di diagnostica:
----------------------------
Browser: ${supportInfo.userAgent}
Piattaforma: ${supportInfo.platform}
Lingue: ${supportInfo.languages.join(', ')}

Supporto riconoscimento vocale:
- SpeechRecognition nativo: ${supportInfo.speechRecognition.nativeAvailable ? 'Sì' : 'No'}
- WebkitSpeechRecognition: ${supportInfo.speechRecognition.webkitAvailable ? 'Sì' : 'No'}
- Supporto rilevato: ${supportInfo.speechRecognition.supported ? 'Sì' : 'No'}

Supporto audio:
- AudioContext: ${supportInfo.audioContext.available ? 'Sì' : 'No'}
- MediaDevices API: ${supportInfo.mediaDevices.available ? 'Sì' : 'No'}
- getUserMedia: ${supportInfo.mediaDevices.getUserMedia ? 'Sì' : 'No'}
- enumerateDevices: ${supportInfo.mediaDevices.enumerateDevices ? 'Sì' : 'No'}

Accesso al microfono: ${supportInfo.microphoneAccessible ? 'Consentito' : 'Negato/Non testato'}

Suggerimenti:
- Assicurati che il microfono sia abilitato nelle impostazioni del browser
- Verifica che non ci siano altre applicazioni che utilizzano il microfono
- Riavvia il browser o l'applicazione
- Controlla le impostazioni del microfono nel pannello di controllo`;
    
    // Copia negli appunti le informazioni
    navigator.clipboard.writeText(infoText)
      .then(() => alert('Informazioni di diagnostica copiate negli appunti!'))
      .catch(() => {
        // Se non è possibile copiare, mostra le informazioni
        alert(infoText);
      });
  }, [testResults]);
  
  return (
    <div className="microphone-test">
      <h2>Test del Microfono</h2>
      
      <div className="test-status">
        <div className={`status-indicator ${testResults.nativeSpeechAvailable ? 'success' : 'error'}`}>
          Riconoscimento vocale nativo: {testResults.nativeSpeechAvailable ? 'Disponibile' : 'Non disponibile'}
        </div>
        
        <div className={`status-indicator ${testResults.microphoneAccessible ? 'success' : testResults.microphoneAccessible === false ? 'error' : 'pending'}`}>
          Microfono: {
            testResults.microphoneAccessible 
              ? 'Accessibile' 
              : testResults.microphoneAccessible === false 
                ? 'Non accessibile' 
                : 'Non testato'
          }
        </div>
        
        {testResults.isListening && (
          <div className="status-indicator listening">
            Ascolto in corso...
          </div>
        )}
      </div>
      
      <div className="test-message">
        {testResults.testMessage}
      </div>
      
      {testResults.recognizedText && (
        <div className="recognized-text">
          <strong>Testo riconosciuto:</strong>
          <p>{testResults.recognizedText}</p>
        </div>
      )}
      
      <div className="test-actions">
        <button 
          className="test-button"
          onClick={testMicrophone}
        >
          Testa Microfono
        </button>
        
        <button 
          className={`test-button ${testResults.isListening ? 'active' : ''}`}
          onClick={testSpeechRecognition}
          disabled={!testResults.nativeSpeechAvailable}
        >
          {testResults.isListening ? 'Ferma Riconoscimento' : 'Testa Riconoscimento Vocale'}
        </button>
        
        <button 
          className="test-button info"
          onClick={generateSupportInfo}
        >
          Informazioni di Supporto
        </button>
      </div>
      
      <div className="troubleshooting-tips">
        <h3>Suggerimenti per la risoluzione dei problemi:</h3>
        <ul>
          <li>Verifica che il microfono sia collegato e funzionante</li>
          <li>Controlla le autorizzazioni del microfono nelle impostazioni del browser</li>
          <li>Assicurati che nessun'altra applicazione stia utilizzando il microfono</li>
          <li>Prova a utilizzare un browser diverso (Chrome o Edge sono consigliati)</li>
          <li>Riavvia l'applicazione o il computer</li>
        </ul>
      </div>
    </div>
  );
};

export default MicrophoneTest;
