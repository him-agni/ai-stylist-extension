import { useState, useEffect } from 'react'
import './index.css'

const API_BASE = 'https://backend-seven-livid-14.vercel.app/api';

function App() {
  const [activeTab, setActiveTab] = useState('tryon');

  // State for Virtual Try On
  const [humanImage, setHumanImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnResult, setTryOnResult] = useState(null);

  // State for AI Stylist
  const [stylistLoading, setStylistLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [stylistImage, setStylistImage] = useState(null);
  const [stylistInputImage, setStylistInputImage] = useState(null);

  // State for Search
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Helper to convert File to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleTryOn = async () => {
    if (!humanImage || !garmentImage) return;
    setTryOnLoading(true);
    try {
      const humanB64 = await toBase64(humanImage);
      const garmentB64 = await toBase64(garmentImage);

      const res = await fetch(`${API_BASE}/try-on`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humanImage: humanB64, garmentImage: garmentB64 })
      });
      const data = await res.json();
      if (data.success) {
        setTryOnResult(data.url);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Try On failed: " + e.message);
    }
    setTryOnLoading(false);
  };

  const handleGetStyling = async () => {
    if ((!stylistImage && !tryOnResult) && chatMessages.length === 0) return;
    if (!chatInput.trim() && chatMessages.length > 0) return;

    setStylistLoading(true);
    const userMessageText = chatInput.trim();
    const newChatMessages = [...chatMessages];

    if (userMessageText || chatMessages.length === 0) {
      newChatMessages.push({ role: 'user', text: userMessageText || "Analyze this outfit and give me styling advice." });
      setChatMessages(newChatMessages);
      setChatInput('');
    }

    try {
      let targetImage = undefined;
      let extraImage = undefined;

      if (chatMessages.length === 0) {
        targetImage = tryOnResult;
        if (stylistImage) {
          targetImage = await toBase64(stylistImage);
        }
        if (stylistInputImage) {
          extraImage = await toBase64(stylistInputImage);
        }
      }

      const res = await fetch(`${API_BASE}/style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetImage,
          inputImage: extraImage,
          message: userMessageText || "",
          history: chatMessages
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        alert("AI Stylist Error: " + data.error);
      }
    } catch (e) {
      alert("Network Error: " + e.message);
    }
    setStylistLoading(false);
  }

  const handleSearch = async () => {
    if (!garmentImage) return;
    setSearchLoading(true);
    try {
      const garmentB64 = await toBase64(garmentImage);
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garmentImage: garmentB64 })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      } else {
        alert("Search failed: " + data.error);
      }
    } catch (e) {
      alert("Search error: " + e.message);
    }
    setSearchLoading(false);
  };

  // File handling
  const MediaInput = ({ label, file, setFile }) => {
    const [urlInput, setUrlInput] = useState('');
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          setFile(new File([blob], "pasted_image.png", { type: blob.type }));
          e.preventDefault(); // Stop text paste if it was an image
          break;
        }
      }
    };

    const handleUrlSubmit = async () => {
      if (!urlInput) return;
      setIsFetchingUrl(true);
      try {
        const res = await fetch(urlInput);
        const blob = await res.blob();
        setFile(new File([blob], "url_image.jpg", { type: blob.type }));
        setUrlInput('');
      } catch (err) {
        alert("Could not load image from URL.\n(Note: Some URLs block direct access due to CORS restrictions. If this happens, please download the image and upload it.)");
      }
      setIsFetchingUrl(false);
    };

    return (
      <div className="input-group" onPaste={handlePaste}>
        <span className="input-label">{label}</span>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Paste image URL or Ctrl+V image here..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontFamily: 'inherit', fontSize: '13px' }}
          />
          <button className="btn-primary" style={{ width: 'auto', padding: '8px 12px' }} onClick={handleUrlSubmit} disabled={isFetchingUrl}>
            {isFetchingUrl ? '...' : 'Load'}
          </button>
        </div>

        <label className="file-upload">
          {file ? (
            <div style={{ color: 'var(--accent)' }}>{file.name} selected</div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Or click here to upload from computer</div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {file && <img src={URL.createObjectURL(file)} className="preview-img" />}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>AI Stylist</h1>
        <p>Virtual Try-On & Smart Fashion</p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Visual Search</button>
        <button className={`tab-btn ${activeTab === 'tryon' ? 'active' : ''}`} onClick={() => setActiveTab('tryon')}>Try-On</button>
        <button className={`tab-btn ${activeTab === 'stylist' ? 'active' : ''}`} onClick={() => setActiveTab('stylist')}>Stylist</button>
      </div>

      {activeTab === 'search' && (
        <div className="glass-card">
          {!searchResults ? (
            <>
              <MediaInput label="Upload clothing to find similar" file={garmentImage} setFile={setGarmentImage} />
              <button className="btn-primary" onClick={handleSearch} disabled={searchLoading || !garmentImage}>
                {searchLoading ? <span className="loader"></span> : "Search via Google Lens"}
              </button>
            </>
          ) : (
            <div className="search-results-container" style={{ animation: 'fadeIn 0.3s ease' }}>
              <button className="btn-primary" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.1)' }} onClick={() => setSearchResults(null)}>Start New Search</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '310px', overflowY: 'auto', paddingRight: '4px' }}>
                {searchResults.map((item, idx) => (
                  <a key={idx} href={item.url} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                    {item.thumbnail && <img src={item.thumbnail} style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{item.title}</div>
                      <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 'bold' }}>{item.price} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '12px' }}>• {item.source}</span></div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tryon' && (
        <div className="glass-card">
          {!tryOnResult ? (
            <>
              <MediaInput label="1. Your Photo" file={humanImage} setFile={setHumanImage} />
              <MediaInput label="2. Clothing Photo" file={garmentImage} setFile={setGarmentImage} />
              <button className="btn-primary" onClick={handleTryOn} disabled={tryOnLoading || !humanImage || !garmentImage}>
                {tryOnLoading ? <span className="loader"></span> : "Generate Try-On"}
              </button>
            </>
          ) : (
            <div className="result-container">
              <img src={tryOnResult === 'mock_try_on_result_url' ? URL.createObjectURL(humanImage) : tryOnResult} className="result-img" alt="Result" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={() => setTryOnResult(null)}>Reset</button>
                <button className="btn-primary" onClick={() => setActiveTab('stylist')}>Get AI Feedback</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stylist' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          {chatMessages.length === 0 ? (
            <>
              <MediaInput label="Upload Custom Outfit Image" file={stylistImage} setFile={setStylistImage} />
              <MediaInput label="Upload Input Garment/Reference Image (Optional)" file={stylistInputImage} setFile={setStylistInputImage} />
              {(!stylistImage && tryOnResult) && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Using previously generated Try-On image:</p>
                  <img src={tryOnResult === 'mock_try_on_result_url' ? URL.createObjectURL(humanImage) : tryOnResult} className="result-img" style={{ maxHeight: '100px', width: 'auto' }} alt="Try-On" />
                </div>
              )}
              <button className="btn-primary" onClick={handleGetStyling} disabled={stylistLoading || (!stylistImage && !tryOnResult)}>
                {stylistLoading ? <span className="loader"></span> : "Start AI Stylist Chat"}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '340px' }}>
              <button className="btn-primary" style={{ marginBottom: '8px', background: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', padding: '6px 12px' }} onClick={() => { setChatMessages([]); setChatInput(''); }}>
                Reset Chat
              </button>
              <div className="chat-window" style={{ flex: 1, overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word', borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px', borderBottomLeftRadius: msg.role === 'model' ? '2px' : '12px' }}>
                    {msg.text}
                  </div>
                ))}
                {stylistLoading && (
                  <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ask the stylist..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetStyling()}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontFamily: 'inherit' }}
                />
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} onClick={handleGetStyling} disabled={stylistLoading || !chatInput.trim()}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
