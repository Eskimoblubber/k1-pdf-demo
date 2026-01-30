'use client';

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  'Part1.Item1.ANumber': string | null;
  'Part1.Item2.USCISAccount': string | null;
  'Part1.Item3.SSN': string | null;
  'Part1.Item4a.K1': boolean;
  'Part1.Item4b.K3': boolean;
  'Part1.Item5.I130Filed': boolean | null;
}

type ScreenId = 
  | 'classification'
  | 'i130'
  | 'anumber-ask'
  | 'anumber-input'
  | 'uscis-ask'
  | 'uscis-input'
  | 'ssn-ask'
  | 'ssn-input'
  | 'summary';

// ============================================================================
// Main Component
// ============================================================================

export default function InterviewPage() {
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    'Part1.Item1.ANumber': null,
    'Part1.Item2.USCISAccount': null,
    'Part1.Item3.SSN': null,
    'Part1.Item4a.K1': false,
    'Part1.Item4b.K3': false,
    'Part1.Item5.I130Filed': null,
  });

  // Current screen
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('classification');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input validation state
  const [aNumberValid, setANumberValid] = useState(false);
  const [uscisValid, setUscisValid] = useState(false);
  const [ssnValid, setSsnValid] = useState(false);

  // ============================================================================
  // Navigation
  // ============================================================================

  const nextScreen = () => {
    switch (currentScreen) {
      case 'classification':
        if (formData['Part1.Item4a.K1']) {
          setCurrentScreen('anumber-ask');
        } else {
          setCurrentScreen('i130');
        }
        break;
      case 'i130':
        setCurrentScreen('anumber-ask');
        break;
      case 'anumber-ask':
        if (formData['Part1.Item1.ANumber'] === 'N/A') {
          setCurrentScreen('uscis-ask');
        } else {
          setCurrentScreen('anumber-input');
        }
        break;
      case 'anumber-input':
        setCurrentScreen('uscis-ask');
        break;
      case 'uscis-ask':
        if (formData['Part1.Item2.USCISAccount'] === 'N/A') {
          setCurrentScreen('ssn-ask');
        } else {
          setCurrentScreen('uscis-input');
        }
        break;
      case 'uscis-input':
        setCurrentScreen('ssn-ask');
        break;
      case 'ssn-ask':
        if (formData['Part1.Item3.SSN'] === 'N/A') {
          setCurrentScreen('summary');
        } else {
          setCurrentScreen('ssn-input');
        }
        break;
      case 'ssn-input':
        setCurrentScreen('summary');
        break;
    }
  };

  const prevScreen = () => {
    switch (currentScreen) {
      case 'i130':
        setCurrentScreen('classification');
        break;
      case 'anumber-ask':
        if (formData['Part1.Item4a.K1']) {
          setCurrentScreen('classification');
        } else {
          setCurrentScreen('i130');
        }
        break;
      case 'anumber-input':
        setCurrentScreen('anumber-ask');
        break;
      case 'uscis-ask':
        if (formData['Part1.Item1.ANumber'] === 'N/A') {
          setCurrentScreen('anumber-ask');
        } else {
          setCurrentScreen('anumber-input');
        }
        break;
      case 'uscis-input':
        setCurrentScreen('uscis-ask');
        break;
      case 'ssn-ask':
        if (formData['Part1.Item2.USCISAccount'] === 'N/A') {
          setCurrentScreen('uscis-ask');
        } else {
          setCurrentScreen('uscis-input');
        }
        break;
      case 'ssn-input':
        setCurrentScreen('ssn-ask');
        break;
      case 'summary':
        if (formData['Part1.Item3.SSN'] === 'N/A') {
          setCurrentScreen('ssn-ask');
        } else {
          setCurrentScreen('ssn-input');
        }
        break;
    }
  };

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const selectClassification = (type: 'K1' | 'K3') => {
    setFormData(prev => ({
      ...prev,
      'Part1.Item4a.K1': type === 'K1',
      'Part1.Item4b.K3': type === 'K3',
      'Part1.Item5.I130Filed': null,
    }));
  };

  const selectI130 = (answer: boolean) => {
    setFormData(prev => ({
      ...prev,
      'Part1.Item5.I130Filed': answer,
    }));
  };

  const selectANumber = (hasIt: boolean) => {
    setFormData(prev => ({
      ...prev,
      'Part1.Item1.ANumber': hasIt ? '' : 'N/A',
    }));
    setANumberValid(false);
  };

  const handleANumberChange = (value: string) => {
    let v = value.toUpperCase();
    if (v && !v.startsWith('A')) {
      v = 'A' + v;
    }
    const isValid = /^A\d{7,9}$/.test(v);
    setANumberValid(isValid);
    setFormData(prev => ({
      ...prev,
      'Part1.Item1.ANumber': v,
    }));
  };

  const selectUSCIS = (hasIt: boolean) => {
    setFormData(prev => ({
      ...prev,
      'Part1.Item2.USCISAccount': hasIt ? '' : 'N/A',
    }));
    setUscisValid(false);
  };

  const handleUSCISChange = (value: string) => {
    const v = value.replace(/\D/g, '');
    const isValid = /^\d{12}$/.test(v);
    setUscisValid(isValid);
    setFormData(prev => ({
      ...prev,
      'Part1.Item2.USCISAccount': v,
    }));
  };

  const selectSSN = (hasIt: boolean) => {
    setFormData(prev => ({
      ...prev,
      'Part1.Item3.SSN': hasIt ? '' : 'N/A',
    }));
    setSsnValid(false);
  };

  const handleSSNChange = (value: string) => {
    let v = value.replace(/\D/g, '');
    // Auto-format
    if (v.length > 3 && v.length <= 5) {
      v = v.slice(0, 3) + '-' + v.slice(3);
    } else if (v.length > 5) {
      v = v.slice(0, 3) + '-' + v.slice(3, 5) + '-' + v.slice(5, 9);
    }
    const isValid = v.replace(/\D/g, '').length === 9;
    setSsnValid(isValid);
    setFormData(prev => ({
      ...prev,
      'Part1.Item3.SSN': v,
    }));
  };

  // ============================================================================
  // PDF Generation
  // ============================================================================

  const generatePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'I-129F.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const canContinue = (): boolean => {
    switch (currentScreen) {
      case 'classification':
        return formData['Part1.Item4a.K1'] || formData['Part1.Item4b.K3'];
      case 'i130':
        return formData['Part1.Item5.I130Filed'] !== null;
      case 'anumber-ask':
        return formData['Part1.Item1.ANumber'] !== null;
      case 'anumber-input':
        return aNumberValid;
      case 'uscis-ask':
        return formData['Part1.Item2.USCISAccount'] !== null;
      case 'uscis-input':
        return uscisValid;
      case 'ssn-ask':
        return formData['Part1.Item3.SSN'] !== null;
      case 'ssn-input':
        return ssnValid;
      default:
        return true;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #2a4365;
          --primary-light: #4a5f85;
          --accent: #d97706;
          --success: #059669;
          --bg: #f8fafc;
          --surface: #ffffff;
          --text: #1e293b;
          --text-light: #64748b;
          --border: #e2e8f0;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Work Sans', sans-serif;
          line-height: 1.6;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
        }
        .container { max-width: 640px; margin: 0 auto; padding: 40px 20px; }
        .card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
        }
        .role-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 12px;
          margin-bottom: 12px;
          background: #f0f4f8;
          color: var(--primary);
          border: 1px solid #c9d6e3;
        }
        .question-title {
          font-family: 'Crimson Pro', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }
        .collab-note {
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 20px;
          font-size: 14px;
          color: var(--text-light);
          line-height: 1.5;
        }
        .collab-note strong { color: var(--text); font-weight: 600; }
        .why-asking {
          background: #f0f9ff;
          border-left: 4px solid var(--primary);
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
        }
        .why-asking-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--primary);
          margin-bottom: 8px;
        }
        .why-asking-text { font-size: 15px; color: var(--text); line-height: 1.5; }
        .choice-buttons { display: flex; gap: 16px; margin-bottom: 24px; }
        .choice-btn {
          flex: 1;
          padding: 16px 24px;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .choice-btn:hover { border-color: var(--primary); background: #f8fafc; }
        .choice-btn.selected { border-color: var(--primary); background: var(--primary); color: white; }
        .radio-group { margin-bottom: 24px; }
        .radio-option {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .radio-option:hover { border-color: var(--primary); background: #f8fafc; }
        .radio-option.selected { border-color: var(--primary); background: #f0f4f8; }
        .radio-option input { width: 20px; height: 20px; margin-right: 12px; cursor: pointer; }
        .radio-label { flex: 1; }
        .radio-label-title { font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .radio-label-desc { font-size: 14px; color: var(--text-light); }
        .input-group { margin-bottom: 24px; }
        .input-label { display: block; font-weight: 600; margin-bottom: 8px; color: var(--text); font-size: 14px; }
        .input-field {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s;
          background: var(--surface);
        }
        .input-field:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(42, 67, 101, 0.1); }
        .input-help { font-size: 13px; color: var(--text-light); margin-top: 8px; font-style: italic; }
        .nav-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid var(--border);
        }
        .btn {
          padding: 14px 32px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-back { background: var(--border); color: var(--text); }
        .btn-back:hover { background: #cbd5e1; }
        .btn-back:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-continue { background: var(--primary); color: white; }
        .btn-continue:hover:not(:disabled) { background: var(--primary-light); transform: translateY(-1px); }
        .btn-continue:disabled { opacity: 0.5; cursor: not-allowed; }
        .summary-item { display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }
        .summary-item:last-child { border-bottom: none; }
        .summary-label { color: var(--text-light); font-size: 14px; }
        .summary-value { font-weight: 600; color: var(--text); }
        .summary-value.na { color: var(--text-light); font-style: italic; }
        .uscis-ref { font-size: 12px; color: var(--text-light); margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border); }
        .error-message { background: #fef2f2; border: 2px solid #ef4444; color: #991b1b; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .btn-loading { position: relative; color: transparent !important; }
        .btn-loading::after {
          content: '';
          position: absolute;
          width: 20px; height: 20px;
          top: 50%; left: 50%;
          margin: -10px 0 0 -10px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="container">
        {/* Classification Screen */}
        {currentScreen === 'classification' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">What type of visa are you petitioning for?</h1>
            
            <div className="collab-note">
              <strong>Filling this out together?</strong> Many couples complete this form as a team. 
              Each question card shows whose information is needed—either the 
              <strong> Petitioner (U.S. Citizen)</strong> or the <strong>Beneficiary (Foreign Fiancé[e])</strong>.
            </div>

            <div className="why-asking">
              <div className="why-asking-label">Why we&apos;re asking</div>
              <div className="why-asking-text">
                This determines which visa classification your fiancé(e) or spouse will receive. 
                Most people choose K-1 for a fiancé(e) they plan to marry in the United States.
              </div>
            </div>

            <div className="radio-group">
              <div 
                className={`radio-option ${formData['Part1.Item4a.K1'] ? 'selected' : ''}`}
                onClick={() => selectClassification('K1')}
              >
                <input type="radio" checked={formData['Part1.Item4a.K1']} readOnly />
                <div className="radio-label">
                  <div className="radio-label-title">K-1 Fiancé(e) Visa</div>
                  <div className="radio-label-desc">For someone you are engaged to and plan to marry in the U.S.</div>
                </div>
              </div>
              <div 
                className={`radio-option ${formData['Part1.Item4b.K3'] ? 'selected' : ''}`}
                onClick={() => selectClassification('K3')}
              >
                <input type="radio" checked={formData['Part1.Item4b.K3']} readOnly />
                <div className="radio-label">
                  <div className="radio-label-title">K-3 Spouse Visa</div>
                  <div className="radio-label-desc">For someone you are already legally married to</div>
                </div>
              </div>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 4</div>

            <div className="nav-buttons">
              <button className="btn btn-back" disabled>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* I-130 Screen (K-3 only) */}
        {currentScreen === 'i130' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">Have you already filed Form I-130 for your spouse?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Why we&apos;re asking</div>
              <div className="why-asking-text">
                The K-3 visa is typically used while waiting for an I-130 petition to be processed. 
                USCIS needs to know if you&apos;ve already started that process.
              </div>
            </div>

            <div className="choice-buttons">
              <button 
                className={`choice-btn ${formData['Part1.Item5.I130Filed'] === true ? 'selected' : ''}`}
                onClick={() => selectI130(true)}
              >Yes</button>
              <button 
                className={`choice-btn ${formData['Part1.Item5.I130Filed'] === false ? 'selected' : ''}`}
                onClick={() => selectI130(false)}
              >No</button>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 5</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* A-Number Ask Screen */}
        {currentScreen === 'anumber-ask' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">Do you have an Alien Registration Number (A-Number)?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Why we&apos;re asking</div>
              <div className="why-asking-text">
                An A-Number is assigned by USCIS if you&apos;ve previously applied for immigration benefits. 
                Most U.S. citizens born in the U.S. won&apos;t have one—and that&apos;s perfectly fine.
              </div>
            </div>

            <div className="choice-buttons">
              <button 
                className={`choice-btn ${formData['Part1.Item1.ANumber'] !== null && formData['Part1.Item1.ANumber'] !== 'N/A' ? 'selected' : ''}`}
                onClick={() => selectANumber(true)}
              >Yes, I have one</button>
              <button 
                className={`choice-btn ${formData['Part1.Item1.ANumber'] === 'N/A' ? 'selected' : ''}`}
                onClick={() => selectANumber(false)}
              >No, I don&apos;t</button>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 1</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* A-Number Input Screen */}
        {currentScreen === 'anumber-input' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">What is your A-Number?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Where to find it</div>
              <div className="why-asking-text">
                Your A-Number appears on documents like your green card, work permit, or any 
                previous USCIS notices. It starts with &quot;A&quot; followed by 7-9 digits.
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">A-Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="A-123456789"
                maxLength={10}
                value={formData['Part1.Item1.ANumber'] || ''}
                onChange={(e) => handleANumberChange(e.target.value)}
              />
              <div className="input-help">Format: A followed by 7-9 digits (e.g., A123456789)</div>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 1</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* USCIS Account Ask Screen */}
        {currentScreen === 'uscis-ask' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">Do you have a USCIS Online Account Number?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Why we&apos;re asking</div>
              <div className="why-asking-text">
                If you&apos;ve created an account on the USCIS website (uscis.gov), you may have a 
                12-digit online account number. This is different from an A-Number. 
                If you&apos;re not sure, it&apos;s okay to say no.
              </div>
            </div>

            <div className="choice-buttons">
              <button 
                className={`choice-btn ${formData['Part1.Item2.USCISAccount'] !== null && formData['Part1.Item2.USCISAccount'] !== 'N/A' ? 'selected' : ''}`}
                onClick={() => selectUSCIS(true)}
              >Yes, I have one</button>
              <button 
                className={`choice-btn ${formData['Part1.Item2.USCISAccount'] === 'N/A' ? 'selected' : ''}`}
                onClick={() => selectUSCIS(false)}
              >No / Not sure</button>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 2</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* USCIS Account Input Screen */}
        {currentScreen === 'uscis-input' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">What is your USCIS Online Account Number?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Where to find it</div>
              <div className="why-asking-text">
                Log in to your USCIS online account at uscis.gov. Your 12-digit account number 
                appears on your profile or dashboard.
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">USCIS Online Account Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="123456789012"
                maxLength={12}
                value={formData['Part1.Item2.USCISAccount'] || ''}
                onChange={(e) => handleUSCISChange(e.target.value)}
              />
              <div className="input-help">12-digit number from your USCIS online account</div>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 2</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* SSN Ask Screen */}
        {currentScreen === 'ssn-ask' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">Do you have a U.S. Social Security Number?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Why we&apos;re asking</div>
              <div className="why-asking-text">
                USCIS uses your Social Security Number to verify your identity. As a U.S. citizen, 
                you likely have one. This information is kept secure and confidential.
              </div>
            </div>

            <div className="choice-buttons">
              <button 
                className={`choice-btn ${formData['Part1.Item3.SSN'] !== null && formData['Part1.Item3.SSN'] !== 'N/A' ? 'selected' : ''}`}
                onClick={() => selectSSN(true)}
              >Yes</button>
              <button 
                className={`choice-btn ${formData['Part1.Item3.SSN'] === 'N/A' ? 'selected' : ''}`}
                onClick={() => selectSSN(false)}
              >No</button>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 3</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* SSN Input Screen */}
        {currentScreen === 'ssn-input' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">What is your Social Security Number?</h1>

            <div className="why-asking">
              <div className="why-asking-label">Privacy note</div>
              <div className="why-asking-text">
                Your Social Security Number is required on this form for identity verification. 
                This information is transmitted securely to USCIS.
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Social Security Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="123-45-6789"
                maxLength={11}
                value={formData['Part1.Item3.SSN'] || ''}
                onChange={(e) => handleSSNChange(e.target.value)}
              />
              <div className="input-help">Format: XXX-XX-XXXX</div>
            </div>

            <div className="uscis-ref">USCIS Form I-129F · Part 1, Item 3</div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button className="btn btn-continue" disabled={!canContinue()} onClick={nextScreen}>Continue</button>
            </div>
          </div>
        )}

        {/* Summary Screen */}
        {currentScreen === 'summary' && (
          <div className="card">
            <div className="role-label">Petitioner (U.S. Citizen)</div>
            <h1 className="question-title">Let&apos;s review your answers</h1>

            <div className="why-asking">
              <div className="why-asking-label">Almost done with this section</div>
              <div className="why-asking-text">
                Here&apos;s what you&apos;ve told us so far. You can go back to make changes if needed.
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div>
              <div className="summary-item">
                <span className="summary-label">Visa Classification</span>
                <span className="summary-value">
                  {formData['Part1.Item4a.K1'] ? 'K-1 (Fiancé/Fiancée)' : 'K-3 (Spouse)'}
                </span>
              </div>

              {formData['Part1.Item4b.K3'] && (
                <div className="summary-item">
                  <span className="summary-label">Form I-130 Filed</span>
                  <span className="summary-value">{formData['Part1.Item5.I130Filed'] ? 'Yes' : 'No'}</span>
                </div>
              )}

              <div className="summary-item">
                <span className="summary-label">A-Number</span>
                <span className={`summary-value ${formData['Part1.Item1.ANumber'] === 'N/A' ? 'na' : ''}`}>
                  {formData['Part1.Item1.ANumber']}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">USCIS Online Account</span>
                <span className={`summary-value ${formData['Part1.Item2.USCISAccount'] === 'N/A' ? 'na' : ''}`}>
                  {formData['Part1.Item2.USCISAccount']}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Social Security Number</span>
                <span className={`summary-value ${formData['Part1.Item3.SSN'] === 'N/A' ? 'na' : ''}`}>
                  {formData['Part1.Item3.SSN'] === 'N/A' 
                    ? 'N/A' 
                    : `***-**-${formData['Part1.Item3.SSN']?.slice(-4)}`}
                </span>
              </div>
            </div>

            <div className="nav-buttons">
              <button className="btn btn-back" onClick={prevScreen}>Back</button>
              <button 
                className={`btn btn-continue ${isLoading ? 'btn-loading' : ''}`}
                onClick={generatePDF}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
