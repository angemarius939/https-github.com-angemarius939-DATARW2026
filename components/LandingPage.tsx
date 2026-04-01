
import React, { useState, useEffect } from 'react';
import { Menu, X, Check, Smartphone, BarChart2, FileText, Shield, Globe, Zap, ChevronRight, Database, Users, Activity, Server } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const capacitySlides = [
    {
      icon: <Database className="text-indigo-500 w-12 h-12 mb-4" />,
      title: "Massive Data Scale",
      value: "10M+",
      description: "Survey responses processed daily with zero latency."
    },
    {
      icon: <Users className="text-blue-500 w-12 h-12 mb-4" />,
      title: "Beneficiary Tracking",
      value: "500k+",
      description: "Individual profiles managed with complete historical data."
    },
    {
      icon: <Activity className="text-emerald-500 w-12 h-12 mb-4" />,
      title: "Financial Processing",
      value: "$50M+",
      description: "In project budgets tracked and reconciled in real-time."
    },
    {
      icon: <Server className="text-purple-500 w-12 h-12 mb-4" />,
      title: "High Availability",
      value: "99.99%",
      description: "Uptime guarantee for critical field operations."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % capacitySlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xl">D</div>
              <span className="font-bold text-xl text-slate-900">DataRW</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-slate-600 hover:text-indigo-600 transition-colors">Products</a>
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <button 
                onClick={onLogin}
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onRegister}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
            <a href="#products" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Products</a>
            <a href="#features" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <button onClick={onLogin} className="w-full text-slate-600 font-medium py-2">Sign In</button>
            <button onClick={onRegister} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 -z-10">
           <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        </div>
        <div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div 
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            <span className="text-sm font-medium text-indigo-800">🚀 Trusted by Many Organizations in Rwanda</span>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto"
          >
            Complete Data & <br/>
            <span className="text-indigo-600">Project Management</span> Platform
          </h1>
          
          <p 
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            From AI-powered surveys to comprehensive project management. Streamline your data collection, monitoring & evaluation, and organizational performance - all in one intelligent platform.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button onClick={onRegister} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-200">
              Start Free Trial
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                 <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-slate-500 border-b-[4px] border-b-transparent ml-0.5"></div>
              </div>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-24 border-y border-slate-200/60 bg-white/40 backdrop-blur-sm py-10 overflow-hidden relative">
          <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by Many Organizations in Rwanda
          </p>
          <div className="flex overflow-hidden relative w-full">
            <div className="flex gap-12 items-center animate-marquee whitespace-nowrap px-6">
              {[
                "Burera District", "Gakenke District", "Gicumbi District", "Musanze District", "Rulindo District",
                "Gisagara District", "Huye District", "Kamonyi District", "Muhanga District", "Nyamagabe District",
                "Nyanza District", "Nyaruguru District", "Ruhango District", "Bugesera District", "Gatsibo District",
                "Kayonza District", "Kirehe District", "Ngoma District", "Nyagatare District", "Rwamagana District",
                "Karongi District", "Ngororero District", "Nyabihu District", "Nyamasheke District", "Rubavu District",
                "Rusizi District", "Rutsiro District", "Gasabo District", "Kicukiro District", "Nyarugenge District",
                "Burera District", "Gakenke District", "Gicumbi District", "Musanze District", "Rulindo District",
                "Gisagara District", "Huye District", "Kamonyi District", "Muhanga District", "Nyamagabe District",
                "Nyanza District", "Nyaruguru District", "Ruhango District", "Bugesera District", "Gatsibo District",
                "Kayonza District", "Kirehe District", "Ngoma District", "Nyagatare District", "Rwamagana District",
                "Karongi District", "Ngororero District", "Nyabihu District", "Nyamasheke District", "Rubavu District",
                "Rusizi District", "Rutsiro District", "Gasabo District", "Kicukiro District", "Nyarugenge District"
              ].map((district, idx) => (
                <span key={idx} className="text-xl font-bold text-slate-300/80">
                  {district}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* System Capacity Animated Slides */}
      <section className="py-20 bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-2">Enterprise Grade</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">Built for Massive Scale</p>
          </div>
          
          <div className="relative h-80 max-w-4xl mx-auto">
              <div
                key={currentSlide}
                className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-2xl"
              >
                {capacitySlides[currentSlide].icon}
                <h3 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">
                  {capacitySlides[currentSlide].value}
                </h3>
                <p className="text-xl md:text-2xl font-bold text-indigo-300 mb-2">
                  {capacitySlides[currentSlide].title}
                </p>
                <p className="text-slate-400 max-w-lg mx-auto">
                  {capacitySlides[currentSlide].description}
                </p>
              </div>
          </div>
          
          <div className="flex justify-center gap-3 mt-8">
            {capacitySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'bg-indigo-500 w-8' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase mb-2">Two Powerful Platforms</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">One Account. Unified Experience.</p>
            <p className="text-slate-600 max-w-2xl mx-auto">Choose the tools you need. Organizations can access both platforms with a single account and unified pricing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* DataRW Surveys */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">DataRW Surveys</h3>
              <p className="text-slate-500 mb-6">AI-Powered Survey Generation & Data Collection</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "AI Survey Generation - Describe needs, get questionnaires",
                  "18 Question Types - From multiple choice to signature",
                  "Document Context Analysis - Upload business plans",
                  "Auto-Translation - Kinyarwanda, French, Spanish",
                  "Mobile App - Offline data collection with sync"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={onRegister} className="w-full py-3 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Try Surveys Platform
              </button>
            </div>

            {/* DataRW Projects */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart2 className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">DataRW Projects</h3>
              <p className="text-slate-500 mb-6">Comprehensive M&E & Project Management</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Project & Activity Management - Full lifecycle tracking",
                  "Budget & Financial Tracking - Real-time monitoring",
                  "KPI Dashboards - Performance metrics & visualization",
                  "Beneficiary Profiles - Complete stakeholder management",
                  "Document Management - Secure repository with version control"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={onRegister} className="w-full py-3 border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Try Projects Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Comprehensive tools for survey creation, data management, and analytics designed for the modern NGO.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-amber-500" />,
                title: "AI Survey Builder",
                desc: "Generate comprehensive surveys using AI with natural language descriptions and document context analysis."
              },
              {
                icon: <BarChart2 className="text-blue-500" />,
                title: "Project Management",
                desc: "Complete M&E system with activity tracking, budgeting, KPI dashboards, and performance monitoring."
              },
              {
                icon: <Globe className="text-green-500" />,
                title: "Beneficiary Management",
                desc: "Profile management with geographic mapping, demographic reports, and stakeholder tracking."
              },
              {
                icon: <Shield className="text-red-500" />,
                title: "Document Repository",
                desc: "Secure storage for program documents, reports, and agreements with version control and access rights."
              },
              {
                icon: <FileText className="text-purple-500" />,
                title: "Automated Reporting",
                desc: "Generate monthly, quarterly, annual reports automatically with customizable templates and exports."
              },
              {
                icon: <Smartphone className="text-slate-700" />,
                title: "Offline Mobile Data",
                desc: "Field researchers can collect data anywhere without internet. Auto-sync when connection is restored."
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors"
              >
                <div className="mb-4 h-10 w-10 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-100">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Choose the perfect plan for your organization's needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="font-semibold text-slate-300 mb-2">Basic</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">100k</span>
                <span className="text-sm text-slate-400">FRW/month</span>
              </div>
              <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-6">4 surveys • 1 GB • 5 users</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> 4 active surveys</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> 1 GB data storage</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> Basic analytics</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> Data export (CSV)</li>
              </ul>
              <button onClick={onRegister} className="w-full py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors font-medium">Get Started</button>
            </div>

            {/* Professional */}
            <div className="bg-indigo-600 rounded-2xl p-8 border border-indigo-500 relative transform md:-translate-y-4 shadow-2xl">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MOST POPULAR</div>
              <h3 className="font-semibold text-indigo-100 mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">300k</span>
                <span className="text-sm text-indigo-200">FRW/month</span>
              </div>
              <p className="text-sm text-indigo-200 mb-6 border-b border-indigo-500/50 pb-6">10 surveys • 3 GB • 20 users</p>
              <ul className="space-y-3 mb-8 text-sm text-indigo-50">
                <li className="flex gap-2"><Check size={16} className="text-white"/> 10 active surveys</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> 3 GB data storage</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Advanced analytics</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Priority support</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Skip logic & calculations</li>
              </ul>
              <button onClick={onRegister} className="w-full py-2 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 transition-colors font-bold">Get Started</button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="font-semibold text-slate-300 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">Custom</span>
              </div>
              <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-6">Unlimited Scale</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> Unlimited surveys</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> Unlimited storage</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> API access & White-label</li>
                <li className="flex gap-2"><Check size={16} className="text-indigo-400"/> Custom integrations</li>
              </ul>
              <button className="w-full py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors font-medium">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

       {/* Mobile App Section */}
       <section id="mobile" className="py-24 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Mobile Data Collection</h2>
               <p className="text-lg text-slate-600">Download our mobile app for offline survey data collection. Perfect for field researchers and enumerators in remote areas.</p>
               
               <div className="grid sm:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-2 rounded-full"><Smartphone size={20} className="text-green-600"/></div>
                      <h3 className="font-bold text-slate-900">Android App</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Version 1.0.0 • 25 MB • Android 5.0+</p>
                    <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                      Download APK
                    </button>
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 opacity-75">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-slate-100 p-2 rounded-full"><Smartphone size={20} className="text-slate-600"/></div>
                      <h3 className="font-bold text-slate-900">iOS App</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Coming Q2 2025</p>
                    <button className="w-full bg-slate-100 text-slate-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                      Coming Soon
                    </button>
                 </div>
               </div>

               <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                     <div className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Offline Collection</div>
                     <div className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Auto-Sync</div>
                     <div className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Secure Access</div>
                     <div className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> GPS Tracking</div>
                  </div>
               </div>
            </div>
            <div className="flex-1 flex justify-center">
               {/* Phone Mockup */}
               <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl"></div>
                 <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
                    <div className="bg-indigo-600 p-6 pt-12 text-white">
                       <h3 className="font-bold text-lg">Active Surveys</h3>
                       <p className="text-indigo-200 text-xs">Organization: Example Org</p>
                    </div>
                    <div className="p-4 space-y-3 bg-slate-50 flex-1">
                       {[1,2,3].map(i => (
                         <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-2">
                             <div className="font-bold text-slate-800 text-sm">Water Access Project {i}</div>
                             <div className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Active</div>
                           </div>
                           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{width: `${i * 25}%`}}></div>
                           </div>
                           <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                              <span>{i * 15} Responses</span>
                              <span>Sync Pending</span>
                           </div>
                         </div>
                       ))}
                    </div>
                    <div className="bg-white p-4 border-t border-slate-100 flex justify-around">
                        <div className="text-indigo-600 flex flex-col items-center"><FileText size={20}/><span className="text-[10px]">Surveys</span></div>
                        <div className="text-slate-400 flex flex-col items-center"><Globe size={20}/><span className="text-[10px]">Map</span></div>
                        <div className="text-slate-400 flex flex-col items-center"><Zap size={20}/><span className="text-[10px]">Settings</span></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
       </section>

       {/* CTA */}
       <section className="bg-indigo-600 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
             <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Data Collection?</h2>
             <p className="text-indigo-100 text-lg mb-8">Join hundreds of organizations already using DataRW to make data-driven decisions.</p>
             <button onClick={onRegister} className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
               Start Your Free Trial Today
             </button>
          </div>
       </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 text-white p-1 rounded-md font-bold text-sm">D</div>
                <span className="font-bold text-lg text-white">DataRW</span>
              </div>
              <p className="text-sm">Empowering organizations across Rwanda with intelligent data collection and analysis tools.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400">Features</a></li>
                <li><a href="#" className="hover:text-indigo-400">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400">About</a></li>
                <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-xs text-center">
            &copy; {new Date().getFullYear()} DataRW. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
