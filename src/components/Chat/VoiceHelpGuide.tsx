import React, { useState } from 'react';
import { FaMicrophone, FaVolumeUp, FaCog, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import './VoiceHelpGuide.css';

interface VoiceHelpGuideProps {
  onClose: () => void;
}

const VoiceHelpGuide: React.FC<VoiceHelpGuideProps> = ({ onClose }) => {
  const [currentTab, setCurrentTab] = useState<'basics' | 'troubleshooting' | 'tips'>('basics');

  return (
    <div className="voice-help-overlay">
      <div className="voice-help-container">
        <div className="voice-help-header">
          <h2><FaQuestionCircle /> Guida al Controllo Vocale</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="voice-help-tabs">
          <button 
            className={`help-tab ${currentTab === 'basics' ? 'active' : ''}`}
            onClick={() => setCurrentTab('basics')}
          >
            Nozioni di base
          </button>
          <button 
            className={`help-tab ${currentTab === 'troubleshooting' ? 'active' : ''}`}
            onClick={() => setCurrentTab('troubleshooting')}
          >
            Risoluzione problemi
          </button>
          <button 
            className={`help-tab ${currentTab === 'tips' ? 'active' : ''}`}
            onClick={() => setCurrentTab('tips')}
          >
            Consigli utili
          </button>
        </div>

        <div className="voice-help-content">
          {currentTab === 'basics' && (
            <div className="help-section">
              <h3>Nozioni di base sul controllo vocale</h3>
              
              <div className="feature-box">
                <div className="feature-icon"><FaMicrophone /></div>
                <div className="feature-content">
                  <h4>Riconoscimento vocale</h4>
                  <p>Premi il pulsante del microfono per iniziare a parlare. L'app ascolterà ciò che dici e lo convertirà in testo. Premi nuovamente per interrompere l'ascolto.</p>
                </div>
              </div>
              
              <div className="feature-box">
                <div className="feature-icon"><FaVolumeUp /></div>
                <div className="feature-content">
                  <h4>Sintesi vocale</h4>
                  <p>Premi il pulsante dell'altoparlante per ascoltare la risposta del bot. Puoi interrompere la lettura in qualsiasi momento premendo nuovamente il pulsante.</p>
                </div>
              </div>
              
              <div className="feature-box">
                <div className="feature-icon"><FaCog /></div>
                <div className="feature-content">
                  <h4>Impostazioni vocali</h4>
                  <p>Fai clic sull'icona delle impostazioni per personalizzare la voce, la velocità e il tono della sintesi vocale.</p>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'troubleshooting' && (
            <div className="help-section">
              <h3>Risoluzione dei problemi</h3>
              
              <div className="troubleshooting-item">
                <h4>Il riconoscimento vocale non funziona</h4>
                <ul>
                  <li>Assicurati che il tuo browser o dispositivo abbia accesso al microfono</li>
                  <li>Verifica che nessun'altra applicazione stia utilizzando il microfono</li>
                  <li>Prova ad aggiornare la pagina o riavviare l'applicazione</li>
                  <li>Utilizza il "Test Microfono" per diagnosticare eventuali problemi</li>
                </ul>
              </div>
              
              <div className="troubleshooting-item">
                <h4>La sintesi vocale non funziona</h4>
                <ul>
                  <li>Verifica che il volume del dispositivo sia attivo</li>
                  <li>Prova a selezionare una voce diversa nelle impostazioni</li>
                  <li>Alcuni browser potrebbero avere limitazioni nella sintesi vocale</li>
                </ul>
              </div>
              
              <div className="troubleshooting-link">
                <p>Hai ancora problemi? Passa alla scheda "Test Microfono" per uno strumento di diagnostica completo.</p>
              </div>
            </div>
          )}

          {currentTab === 'tips' && (
            <div className="help-section">
              <h3>Consigli utili</h3>
              
              <div className="tip-item">
                <h4>Parla chiaramente</h4>
                <p>Per ottenere risultati migliori, parla in modo chiaro e a un ritmo normale. Evita rumori di fondo eccessivi.</p>
              </div>
              
              <div className="tip-item">
                <h4>Frasi brevi e precise</h4>
                <p>Il riconoscimento vocale funziona meglio con frasi brevi e precise anziché lunghi monologhi.</p>
              </div>
              
              <div className="tip-item">
                <h4>Personalizza la voce</h4>
                <p>Sperimenta con diverse voci, velocità e toni nelle impostazioni per trovare la combinazione più comoda per te.</p>
              </div>
              
              <div className="tip-item">
                <h4>Scorciatoie vocali</h4>
                <p>Puoi utilizzare frasi come "cancella chat" o "leggi ultima risposta" per controllare alcune funzioni dell'app.</p>
              </div>
            </div>
          )}
        </div>

        <div className="voice-help-footer">
          <button className="help-action-button" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceHelpGuide;
