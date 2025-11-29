import React, { useState, useMemo } from 'react';
import { UsageMetrics } from '../hooks/useAnalytics';
import './AnalyticsDashboard.css';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  metrics: UsageMetrics;
  onClose: () => void;
  onExport: () => void;
  onReset: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  metrics,
  onClose,
  onExport,
  onReset
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  if (!isOpen) return null;

  const messagesLast7Days = useMemo(() => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        count: metrics.messagesPerDay[dateStr] || 0
      });
    }

    return last7Days;
  }, [metrics.messagesPerDay]);

  const topModels = useMemo(() => {
    return Object.entries(metrics.tokensPerModel)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, tokens]) => ({
        model,
        tokens,
        cost: metrics.costPerModel[model] || 0
      }));
  }, [metrics.tokensPerModel, metrics.costPerModel]);

  const topAssistants = useMemo(() => {
    return Object.entries(metrics.assistantUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [metrics.assistantUsage]);

  const maxMessages = Math.max(...messagesLast7Days.map(d => d.count), 1);

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        <div className="analytics-header">
          <h2>📊 Analytics Dashboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="analytics-toolbar">
          <button onClick={onExport} className="btn-secondary">
            📤 Esporta Dati
          </button>
          <button
            onClick={() => {
              if (confirm('Sei sicuro di voler resettare tutte le statistiche?')) {
                onReset();
              }
            }}
            className="btn-danger"
          >
            🗑️ Reset
          </button>
        </div>

        <div className="analytics-content">
          {/* Summary Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-value">{metrics.totalMessages.toLocaleString()}</div>
              <div className="metric-label">Messaggi Totali</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🔢</div>
              <div className="metric-value">{metrics.totalTokens.toLocaleString()}</div>
              <div className="metric-label">Token Utilizzati</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">${metrics.totalCost.toFixed(4)}</div>
              <div className="metric-label">Costo Stimato</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📝</div>
              <div className="metric-value">{metrics.conversationCount}</div>
              <div className="metric-label">Conversazioni</div>
            </div>
          </div>

          {/* Messages Chart */}
          <div className="chart-section">
            <h3>Messaggi Ultimi 7 Giorni</h3>
            <div className="bar-chart">
              {messagesLast7Days.map(({ date, count }) => (
                <div key={date} className="bar-container">
                  <div
                    className="bar"
                    style={{
                      height: `${(count / maxMessages) * 100}%`
                    }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                  <div className="bar-label">{date.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Models */}
          <div className="top-section">
            <h3>Modelli Più Utilizzati</h3>
            <div className="top-list">
              {topModels.map(({ model, tokens, cost }, index) => (
                <div key={model} className="top-item">
                  <div className="top-rank">#{index + 1}</div>
                  <div className="top-info">
                    <div className="top-name">{model.split('/')[1] || model}</div>
                    <div className="top-stats">
                      {tokens.toLocaleString()} tokens • ${cost.toFixed(4)}
                    </div>
                  </div>
                  <div className="top-bar">
                    <div
                      className="top-bar-fill"
                      style={{
                        width: `${(tokens / topModels[0].tokens) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Assistants */}
          <div className="top-section">
            <h3>Assistenti Più Utilizzati</h3>
            <div className="top-list">
              {topAssistants.map(([assistant, count], index) => (
                <div key={assistant} className="top-item">
                  <div className="top-rank">#{index + 1}</div>
                  <div className="top-info">
                    <div className="top-name">{assistant}</div>
                    <div className="top-stats">{count} utilizzi</div>
                  </div>
                  <div className="top-bar">
                    <div
                      className="top-bar-fill"
                      style={{
                        width: `${(count / topAssistants[0][1]) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Keywords */}
          {metrics.topKeywords.length > 0 && (
            <div className="keywords-section">
              <h3>Parole Chiave Più Frequenti</h3>
              <div className="keywords-cloud">
                {metrics.topKeywords.slice(0, 15).map(({ keyword, count }) => {
                  const maxCount = metrics.topKeywords[0].count;
                  const size = 12 + (count / maxCount) * 16;
                  return (
                    <span
                      key={keyword}
                      className="keyword-tag"
                      style={{ fontSize: `${size}px` }}
                    >
                      {keyword}
                      <span className="keyword-count">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Stats */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Lunghezza Media Messaggio</div>
              <div className="stat-value">{Math.round(metrics.averageMessageLength)} caratteri</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Ultimo Aggiornamento</div>
              <div className="stat-value">
                {metrics.lastUpdated.toLocaleString('it-IT')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
