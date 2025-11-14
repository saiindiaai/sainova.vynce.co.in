import React, { useState, useEffect } from 'react';
import { Home, Settings, Shield, FileText, RefreshCw, Sparkles } from 'lucide-react';
import { fetchLauncherConfig } from './api';

export default function VynceApp() {
  const [launcherConfig, setLauncherConfig] = useState(null);
  const [stage, setStage] = useState('initial-loading');
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [legalView, setLegalView] = useState(null);
  const [theme, setTheme] = useState('light');
  const [resolution, setResolution] = useState('high');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [readingLegal, setReadingLegal] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [warp, setWarp] = useState(false);
  const gradientMap = {
  "from-blue-500 to-purple-600": "from-blue-500 to-purple-600",
  "from-pink-500 to-rose-600": "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600": "from-cyan-500 to-blue-600",
};

  const themes = {
    light: { 
      bg: 'bg-gradient-to-br from-white via-gray-50 to-gray-100', 
      cardBg: 'bg-white/90 backdrop-blur-lg', 
      cardBorder: 'border-gray-200', 
      text: 'text-black', 
      textSecondary: 'text-gray-600', 
      hover: 'hover:bg-gray-50',
      accent: 'from-gray-700 to-black'
    },
    dark: { 
      bg: 'bg-gradient-to-br from-black via-gray-900 to-gray-800', 
      cardBg: 'bg-gray-900/50 backdrop-blur-lg', 
      cardBorder: 'border-gray-700', 
      text: 'text-white', 
      textSecondary: 'text-gray-400', 
      hover: 'hover:bg-gray-800/50',
      accent: 'from-gray-300 to-white'
    },
    evening: { 
      bg: 'bg-gradient-to-br from-black via-orange-900/40 to-pink-900/40', 
      cardBg: 'bg-black/50 backdrop-blur-lg', 
      cardBorder: 'border-orange-500/30', 
      text: 'text-white', 
      textSecondary: 'text-orange-200', 
      hover: 'hover:bg-orange-900/20',
      accent: 'from-orange-400 via-pink-400 to-cyan-400'
    }
  };

  const currentTheme = themes[theme];

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    document.body.style.margin = '0';
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  }, []);

useEffect(() => {
  async function loadConfig() {
    try {
      const data = await fetchLauncherConfig();
      console.log("🔥 LAUNCHER CONFIG LOADED:", data);   // ADD THIS
      setLauncherConfig(data);
    } catch (err) {
      console.error("Failed to load launcher config:", err);
    }
  }
  loadConfig();
}, []);

  useEffect(() => {
    if (stage === 'initial-loading' || stage === 'app-loading') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
  clearInterval(interval);

  // Step 1: fade the loader out
  setFadeOut(true);

  setTimeout(() => {
    // Step 2: warp burst
    setWarp(true);

    setTimeout(() => {
      // Step 3: actually switch screen
      const next = stage === 'initial-loading' ? 'home' : 'app-content';
      setStage(next);

      // reset effects
      setFadeOut(false);
      setWarp(false);

      // show Terms after first load only (no extra loader)
      if (stage === 'initial-loading' && !termsAccepted) {
        setShowTermsPopup(true);
      }
    }, 500); // warp duration
  }, 300);   // fade duration

  return 100;
}
          return prev + 4;
        });
      }, 10);
      return () => clearInterval(interval);
    }
  }, [stage, termsAccepted]);

  const handleAppClick = (app) => {
    if (!termsAccepted) { setShowTermsPopup(true); return; }
    setSelectedApp(app);
    setStage('app-loading');
  };

  const renderStarfield = () => (
    <div className="absolute inset-0">
      {[...Array(resolution === 'high' ? 200 : 80)].map((_, i) => {
        const size = Math.random();
        return (
          <div key={i} className="absolute rounded-full animate-twinkle"
            style={{
              width: size > 0.8 ? '3px' : '1px', height: size > 0.8 ? '3px' : '1px',
              backgroundColor: size > 0.7 ? '#60a5fa' : '#ffffff',
              top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        );
      })}
    </div>
  );

  const renderPortal = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {[...Array(resolution === 'high' ? 8 : 4)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${(i + 1) * 80}px`, height: `${(i + 1) * 80}px`,
              border: '2px solid rgba(96, 165, 250, 0.3)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              animation: `portalPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  if (showTermsPopup && !termsAccepted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {renderStarfield()}
        <div className="relative z-10 max-w-2xl w-full">
          {readingLegal ? (
            <div className="backdrop-blur-xl bg-gray-900 bg-opacity-90 border border-blue-500 border-opacity-30 rounded-3xl p-8 max-h-screen overflow-auto">
              <button onClick={() => setReadingLegal(null)} className="mb-4 text-blue-400">← Back</button>
              <div className="text-white space-y-4 text-sm">
                <h2 className="text-3xl font-bold">{readingLegal === 'privacy' ? 'Privacy Policy – Vynce' : 'Terms & Conditions – Vynce'}</h2>
                <p className="text-gray-400">Last Updated: 2025</p>
                {readingLegal === 'privacy' ? (
                  <>
                    <p className="leading-relaxed">Vynce ("we", "our", "us") provides social features through Vynce Social, dating features through Vynce Connect, and AI tools through Promptane. By using our services, you agree to this Privacy Policy.</p>
                    
                    <h3 className="text-xl font-bold mt-6">1. INFORMATION WE COLLECT</h3>
                    <p>• Account Data: username, email, phone (if provided).</p>
                    <p>• Content: posts, chats, shared media, APK uploads on Vynce Store.</p>
                    <p>• Device Data: app version, IP, device model (for security only).</p>
                    <p>• Usage Data: interactions, features used, crash logs.</p>

                    <h3 className="text-xl font-bold mt-6">2. HOW WE USE INFORMATION</h3>
                    <p>• To operate Vynce Social, Vynce Connect, Promptane, and Vynce Store.</p>
                    <p>• To keep users safe through security checks and abuse detection.</p>
                    <p>• To improve performance, recommendations, and global reliability.</p>
                    <p>• To prevent scams, fraud, illegal activities and account misuse.</p>

                    <h3 className="text-xl font-bold mt-6">3. CHILD SAFETY</h3>
                    <p>• No users under 13 allowed.</p>
                    <p>• Strict action against grooming, exploitation, or harmful behaviour.</p>
                    <p>• Reports are monitored 24/7 and escalated when required.</p>

                    <h3 className="text-xl font-bold mt-6">4. CONTENT RULES</h3>
                    <p>• APK sharing allowed only if safe, legal, and not harmful.</p>
                    <p>• ABSOLUTELY NO NSFW, porn, sexual content, or explicit behaviour.</p>
                    <p>• Dating allowed only in Vynce Connect with strict safety checks.</p>
                    <p>• No hate speech, violence, scams, impersonation or illegal content.</p>

                    <h3 className="text-xl font-bold mt-6">5. DATA SECURITY</h3>
                    <p>• Encrypted storage and encrypted data transfer.</p>
                    <p>• Limited access to internal systems.</p>
                    <p className="text-yellow-400 font-semibold">• We do NOT sell your personal data.</p>

                    <h3 className="text-xl font-bold mt-6">6. THIRD-PARTY SERVICES</h3>
                    <p>• Payment, analytics, and cloud services may assist in operations.</p>
                    <p>• They follow strict confidentiality requirements.</p>

                    <h3 className="text-xl font-bold mt-6">7. YOUR RIGHTS</h3>
                    <p>• Edit or delete your account data anytime.</p>
                    <p>• Download your data (coming soon).</p>
                    <p>• Request account deletion permanently.</p>

                    <h3 className="text-xl font-bold mt-6">8. CHANGES TO POLICY</h3>
                    <p>We may update this Privacy Policy. Continued use means acceptance.</p>

                    <h3 className="text-xl font-bold mt-6">9. CONTACT</h3>
                    <p>For privacy concerns: <a href="mailto:sai.india.ai@zohomail.in" className="text-blue-400 underline">sai.india.ai@zohomail.in</a></p>
                  </>
                ) : (
                  <>
                    <p className="leading-relaxed">Welcome to Vynce. By using Vynce Social, Vynce Connect, Promptane, or Vynce Store, you agree to follow these terms.</p>
                    
                    <h3 className="text-xl font-bold mt-6">1. ELIGIBILITY</h3>
                    <p>• Minimum age: 13 for Vynce Social & Promptane.</p>
                    <p>• Minimum age: 18 for Vynce Connect (dating).</p>

                    <h3 className="text-xl font-bold mt-6">2. USER RESPONSIBILITIES</h3>
                    <p>• You are responsible for all activity on your account.</p>
                    <p>• Do NOT upload NSFW or harmful content.</p>
                    <p>• APK uploads must be safe, legal, and virus-free.</p>
                    <p>• No harassment, abuse, threats, or scams.</p>
                    <p>• No impersonation of people, brands, or celebrities.</p>

                    <h3 className="text-xl font-bold mt-6">3. VYNCE CONNECT RULES</h3>
                    <p>• Dating features require honest information.</p>
                    <p>• Fake profiles, catfishing, or romantic scams are banned.</p>
                    <p>• Respect other users and maintain safety.</p>

                    <h3 className="text-xl font-bold mt-6">4. VYNCE STORE (APK SHARING)</h3>
                    <p>• Only upload apps you own or have permission to distribute.</p>
                    <p>• No malware, illegal tools, hacking apps, or harmful files.</p>
                    <p>• Vynce may scan APKs for safety.</p>

                    <h3 className="text-xl font-bold mt-6">5. CONTENT OWNERSHIP</h3>
                    <p>• You own your content but give Vynce permission to show it.</p>
                    <p>• We can remove content violating rules.</p>

                    <h3 className="text-xl font-bold mt-6">6. SAFETY & ENFORCEMENT</h3>
                    <p>• We may suspend or terminate accounts breaking the rules.</p>
                    <p>• Severe cases may be reported to legal authorities.</p>

                    <h3 className="text-xl font-bold mt-6">7. LIMITATION OF LIABILITY</h3>
                    <p>• We are not responsible for losses caused by misuse of the app.</p>
                    <p>• Services may face downtime during updates or technical issues.</p>

                    <h3 className="text-xl font-bold mt-6">8. CHANGES TO TERMS</h3>
                    <p>We may modify these Terms. Continued use means acceptance.</p>

                    <h3 className="text-xl font-bold mt-6">9. CONTACT</h3>
                    <p>For support: <a href="mailto:sai.india.ai@zohomail.in" className="text-blue-400 underline">sai.india.ai@zohomail.in</a></p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-gray-900 bg-opacity-90 border border-blue-500 border-opacity-30 rounded-3xl p-8 text-center">
              <Shield className="w-20 h-20 text-blue-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Vynce</h2>
              <p className="text-gray-300 mb-6">Before you continue, please review our policies</p>
              <div className="space-y-3 mb-8">
                <button onClick={() => setReadingLegal('privacy')}
                  className="w-full flex items-center justify-between p-4 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 border border-blue-400 border-opacity-30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">Privacy Policy</span>
                  </div>
                  <span className="text-blue-400">Read →</span>
                </button>
                <button onClick={() => setReadingLegal('terms')}
                  className="w-full flex items-center justify-between p-4 bg-purple-500 bg-opacity-20 hover:bg-opacity-30 border border-purple-400 border-opacity-30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">Terms & Conditions</span>
                  </div>
                  <span className="text-purple-400">Read →</span>
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-6">By clicking "I Accept", you agree to our policies</p>
              <div className="flex gap-4">
                <button onClick={() => alert('You must accept to use Vynce.')}
                  className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold">Decline</button>
                <button onClick={() => { setTermsAccepted(true); setShowTermsPopup(false); setReadingLegal(null); }}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold">I Accept</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'initial-loading') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {renderStarfield()}
        {renderPortal()}
        <div className={`relative z-10 text-center px-8 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-9xl font-black text-white mb-3" style={{
            background: 'linear-gradient(to right, #ffffff, #93c5fd, #ffffff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.8))',
            animation: 'float 3s ease-in-out infinite'
          }}>Vynce</h1>
          <p className="text-2xl text-blue-300 font-light animate-pulse mb-2">One platform. Infinite possibilities.</p>
          <p className="text-lg text-blue-400 font-light mb-12">Entering your universe...</p>
          <div className="w-96 mx-auto mb-6">
            <div className="h-3 bg-white bg-opacity-10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 0.3s', boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)'
              }} />
            </div>
          </div>
          <p className="text-blue-400 text-xl font-mono font-bold">{Math.round(progress)}%</p>
        </div>
        <style>{`
          @keyframes portalPulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; } 50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}</style>
      </div>
    );
  }

  if (stage === 'app-loading' && selectedApp) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {renderStarfield()}
        {renderPortal()}
        <div className="relative z-10 text-center px-8">
          <div className="mb-8 text-8xl" style={{ animation: 'float 2s ease-in-out infinite' }}>{selectedApp.icon}</div>
          <h1 className="text-6xl font-black text-white mb-4">{selectedApp.name}</h1>
          <p className="text-xl text-blue-300 mb-12">Loading your experience...</p>
          <div className="w-96 mx-auto mb-6">
            <div className="h-3 bg-white bg-opacity-10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
          <p className="text-blue-400 text-xl font-mono font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {fadeOut && <div className="fade-out-overlay"></div>}
    {warp && <div className="warp-overlay"><div className="scanline"></div></div>}
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col transition-colors duration-500`}>
      <div className={`${currentTheme.cardBg} border-b ${currentTheme.cardBorder} p-4 shadow-xl backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className={`w-8 h-8 ${theme === 'evening' ? 'text-orange-400' : theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </div>
            <h1 className={`text-3xl font-black ${currentTheme.text}`}>Vynce</h1>
          </div>
          <div className={`${currentTheme.textSecondary} text-sm font-medium`}>Welcome back! 👋</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-20">
  {activeTab === "home" && stage === "home" && (
  <div className="px-4 py-6 max-w-7xl mx-auto">
    <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6`}>
      <span>Vynce Ecosystem</span>
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {launcherConfig?.apps?.map((app) => {
        const gradient = gradientMap[app.gradient] || "from-blue-500 to-purple-600";

        return (
          <button
            key={app.id}
            onClick={() => handleAppClick(app)}
            className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105`}
          >
            <div className={`aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center text-6xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
              <span className="relative z-10 group-hover:scale-110 transition-transform">
                {app.icon ?? "✨"}
              </span>
            </div>
            <div className="p-4">
              <h3 className={`font-bold ${currentTheme.text} text-lg mb-1`}>
                {app.name}
              </h3>
              <p className={`${currentTheme.textSecondary} text-sm`}>
                {app.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
)}

        {activeTab === 'home' && stage === 'app-content' && selectedApp && (
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="text-8xl mb-6">{selectedApp.icon}</div>
              <h1 className={`text-5xl font-bold ${currentTheme.text} mb-4`}>{selectedApp.name}</h1>
              <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
                <p className="text-2xl text-yellow-500 font-bold mb-4">🚧 Under Construction 🚧</p>
                <p className={`text-lg ${currentTheme.textSecondary}`}>This app is being built. Check back soon!</p>
              </div>
              <button onClick={() => setStage('home')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold">← Back to Home</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="px-4 py-6 max-w-2xl mx-auto">
            <h2 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>⚙️ Settings</h2>

            <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-2xl p-6 mb-4 shadow-xl`}>
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                <span>🎨</span> Theme
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'evening'].map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === t ? 'border-black bg-gray-100 scale-105' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="text-2xl mb-2">{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🌆'}</div>
                    <div className={`text-sm font-semibold capitalize ${theme === t ? 'text-black' : ''}`}>{t}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-2xl p-6 mb-4 shadow-xl`}>
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                <span>📱</span> Resolution
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['high', 'low'].map((r) => (
                  <button key={r} onClick={() => setResolution(r)}
                    className={`p-4 rounded-xl border-2 transition-all ${resolution === r ? 'border-green-500 bg-green-500/10 scale-105' : 'border-gray-300 hover:border-green-300'}`}>
                    <div className="text-2xl mb-2">{r === 'high' ? '⚡' : '🔋'}</div>
                    <div className={`text-sm font-semibold ${currentTheme.text} ${resolution === r ? 'text-green-600' : ''}`}>{r === 'high' ? 'High Quality' : 'Low Quality'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-2xl p-6 mb-4 shadow-xl`}>
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                <span>📄</span> Legal
              </h3>
              <div className="space-y-3">
                <button onClick={() => setLegalView('privacy')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl ${currentTheme.hover} border ${currentTheme.cardBorder} transition-all hover:scale-102 hover:shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${theme === 'evening' ? 'text-orange-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                    <span className={`font-semibold ${currentTheme.text}`}>Privacy Policy</span>
                  </div>
                  <span className={currentTheme.textSecondary}>→</span>
                </button>
                <button onClick={() => setLegalView('terms')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl ${currentTheme.hover} border ${currentTheme.cardBorder} transition-all hover:scale-102 hover:shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${theme === 'evening' ? 'text-pink-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                    <span className={`font-semibold ${currentTheme.text}`}>Terms & Conditions</span>
                  </div>
                  <span className={currentTheme.textSecondary}>→</span>
                </button>
              </div>
            </div>

            <button onClick={() => { setActiveTab('home'); setStage('initial-loading'); setProgress(0); setSelectedApp(null); setLegalView(null); }}
              className={`w-full ${theme === 'evening' ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-cyan-500' : theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'bg-gradient-to-r from-gray-800 to-black'} text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105`}>
              <RefreshCw className="w-6 h-6" />
              Reload App
            </button>
          </div>
        )}

        {legalView && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto">
            <div className="min-h-screen p-4 flex items-center justify-center">
              <div className={`${currentTheme.cardBg} border ${currentTheme.cardBorder} rounded-2xl p-8 max-w-4xl w-full shadow-2xl`}>
                <button onClick={() => setLegalView(null)} className="mb-6 text-blue-500 font-semibold">← Back</button>
                <h1 className="text-4xl font-bold mb-4">{legalView === 'privacy' ? 'Privacy Policy – Vynce' : 'Terms & Conditions – Vynce'}</h1>
                <p className={currentTheme.textSecondary}>Last Updated: 2025</p>
                <div className={`${currentTheme.textSecondary} mt-6 space-y-4 text-sm leading-relaxed`}>
                  {legalView === 'privacy' ? (
                    <>
                      <p>Vynce ("we", "our", "us") provides social features through Vynce Social, dating features through Vynce Connect, and AI tools through Promptane. By using our services, you agree to this Privacy Policy.</p>
                      
                      <h3 className="text-xl font-bold text-blue-500 mt-6">1. INFORMATION WE COLLECT</h3>
                      <p>• Account Data: username, email, phone (if provided).</p>
                      <p>• Content: posts, chats, shared media, APK uploads on Vynce Store.</p>
                      <p>• Device Data: app version, IP, device model (for security only).</p>
                      <p>• Usage Data: interactions, features used, crash logs.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">2. HOW WE USE INFORMATION</h3>
                      <p>• To operate Vynce Social, Vynce Connect, Promptane, and Vynce Store.</p>
                      <p>• To keep users safe through security checks and abuse detection.</p>
                      <p>• To improve performance, recommendations, and global reliability.</p>
                      <p>• To prevent scams, fraud, illegal activities and account misuse.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">3. CHILD SAFETY</h3>
                      <p>• No users under 13 allowed.</p>
                      <p>• Strict action against grooming, exploitation, or harmful behaviour.</p>
                      <p>• Reports are monitored 24/7 and escalated when required.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">4. CONTENT RULES</h3>
                      <p>• APK sharing allowed only if safe, legal, and not harmful.</p>
                      <p>• ABSOLUTELY NO NSFW, porn, sexual content, or explicit behaviour.</p>
                      <p>• Dating allowed only in Vynce Connect with strict safety checks.</p>
                      <p>• No hate speech, violence, scams, impersonation or illegal content.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">5. DATA SECURITY</h3>
                      <p>• Encrypted storage and encrypted data transfer.</p>
                      <p>• Limited access to internal systems.</p>
                      <p className="text-yellow-500 font-semibold">• We do NOT sell your personal data.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">6. THIRD-PARTY SERVICES</h3>
                      <p>• Payment, analytics, and cloud services may assist in operations.</p>
                      <p>• They follow strict confidentiality requirements.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">7. YOUR RIGHTS</h3>
                      <p>• Edit or delete your account data anytime.</p>
                      <p>• Download your data (coming soon).</p>
                      <p>• Request account deletion permanently.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">8. CHANGES TO POLICY</h3>
                      <p>We may update this Privacy Policy. Continued use means acceptance.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">9. CONTACT</h3>
                      <p>For privacy concerns: <a href="mailto:sai.india.ai@zohomail.in" className="text-blue-500 underline">sai.india.ai@zohomail.in</a></p>
                    </>
                  ) : (
                    <>
                      <p>Welcome to Vynce. By using Vynce Social, Vynce Connect, Promptane, or Vynce Store, you agree to follow these terms.</p>
                      
                      <h3 className="text-xl font-bold text-blue-500 mt-6">1. ELIGIBILITY</h3>
                      <p>• Minimum age: 13 for Vynce Social & Promptane.</p>
                      <p>• Minimum age: 18 for Vynce Connect (dating).</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">2. USER RESPONSIBILITIES</h3>
                      <p>• You are responsible for all activity on your account.</p>
                      <p>• Do NOT upload NSFW or harmful content.</p>
                      <p>• APK uploads must be safe, legal, and virus-free.</p>
                      <p>• No harassment, abuse, threats, or scams.</p>
                      <p>• No impersonation of people, brands, or celebrities.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">3. VYNCE CONNECT RULES</h3>
                      <p>• Dating features require honest information.</p>
                      <p>• Fake profiles, catfishing, or romantic scams are banned.</p>
                      <p>• Respect other users and maintain safety.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">4. VYNCE STORE (APK SHARING)</h3>
                      <p>• Only upload apps you own or have permission to distribute.</p>
                      <p>• No malware, illegal tools, hacking apps, or harmful files.</p>
                      <p>• Vynce may scan APKs for safety.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">5. CONTENT OWNERSHIP</h3>
                      <p>• You own your content but give Vynce permission to show it.</p>
                      <p>• We can remove content violating rules.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">6. SAFETY & ENFORCEMENT</h3>
                      <p>• We may suspend or terminate accounts breaking the rules.</p>
                      <p>• Severe cases may be reported to legal authorities.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">7. LIMITATION OF LIABILITY</h3>
                      <p>• We are not responsible for losses caused by misuse of the app.</p>
                      <p>• Services may face downtime during updates or technical issues.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">8. CHANGES TO TERMS</h3>
                      <p>We may modify these Terms. Continued use means acceptance.</p>

                      <h3 className="text-xl font-bold text-blue-500 mt-6">9. CONTACT</h3>
                      <p>For support: <a href="mailto:sai.india.ai@zohomail.in" className="text-blue-500 underline">sai.india.ai@zohomail.in</a></p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
</div>  {/* closes big wrapper */}

        {/* ✅ Bottom Navigation */}
        <div className={`fixed bottom-0 left-0 right-0 z-20 ${currentTheme.cardBg} border-t ${currentTheme.cardBorder} shadow-lg`}>
          <div className="max-w-2xl mx-auto flex justify-around items-center px-4 py-3">
            
            {/* Home */}
            <button
              onClick={() => { setActiveTab('home'); if (stage === 'app-content') setStage('home'); }}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg ${
                activeTab === 'home'
                  ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                  : currentTheme.textSecondary
              }`}>
              <Home className="w-6 h-6" />
              <span className="text-xs font-semibold">Home</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg ${
                activeTab === 'settings'
                  ? 'bg-blue-500 bg-opacity-20 text-blue-500'
                  : currentTheme.textSecondary
              }`}>
              <Settings className="w-6 h-6" />
              <span className="text-xs font-semibold">Settings</span>
            </button>

          </div>
        </div>  {/* ✅ closes bottom nav */}
      </div>    {/* ✅ closes MAIN WRAPPER */}
    </>
  );
}
