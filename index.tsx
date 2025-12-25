
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Smartphone, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2,
  Phone,
  MessageCircle,
  AlertCircle,
  CreditCard,
  Send
} from 'lucide-react';

// Configuration de l'IA (support client)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type Page = 'home' | 'order' | 'payment' | 'confirmation';
type Operator = 'MTN' | 'Orange' | 'Moov';
type ServiceType = 'Crédit' | 'Data' | 'Appel';

const DATA_PACKS = [
  { label: '220 Mo', price: 200 },
  { label: '400 Mo', price: 300 },
  { label: '340 Mo (Life TV)', price: 900 },
  { label: '2 Go', price: 2000 },
  { label: '5 Go', price: 4000 },
  { label: '10 Go', price: 7000 },
];

const OPERATORS = [
  { 
    id: 'MTN', 
    name: 'MTN', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/MTN_Logo.svg',
    color: '#FFCC00',
    textColor: 'text-black',
    activeBg: 'bg-[#FFCC00]',
    activeBorder: 'border-[#FFCC00]',
    ringColor: 'ring-[#FFCC00]'
  },
  { 
    id: 'Orange', 
    name: 'Orange', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg',
    color: '#FF7900',
    textColor: 'text-white',
    activeBg: 'bg-[#FF7900]',
    activeBorder: 'border-[#FF7900]',
    ringColor: 'ring-[#FF7900]'
  },
  { 
    id: 'Moov', 
    name: 'Moov', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Moov_Africa_Logo.png',
    color: '#0055A4',
    textColor: 'text-white',
    activeBg: 'bg-[#0055A4]',
    activeBorder: 'border-[#0055A4]',
    ringColor: 'ring-[#0055A4]'
  }
];

const App = () => {
  const [page, setPage] = useState<Page>('home');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    operator: 'MTN' as Operator,
    serviceType: 'Crédit' as ServiceType,
    amount: '',
    dataPack: DATA_PACKS[0].label
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Détection automatique de l'opérateur en fonction du préfixe
  useEffect(() => {
    const prefix = formData.phoneNumber.substring(0, 2);
    if (prefix === '01') {
      setFormData(prev => ({ ...prev, operator: 'Moov' }));
    } else if (prefix === '05') {
      setFormData(prev => ({ ...prev, operator: 'MTN' }));
    } else if (prefix === '07') {
      setFormData(prev => ({ ...prev, operator: 'Orange' }));
    }
  }, [formData.phoneNumber]);

  const finalPrice = React.useMemo(() => {
    if (formData.serviceType === 'Data') {
      const pack = DATA_PACKS.find(p => p.label === formData.dataPack);
      return pack ? pack.price : 0;
    }
    if (formData.serviceType === 'Appel') {
        return 500; 
    }
    return Number(formData.amount) || 0;
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Nom requis";
    if (!formData.phoneNumber.match(/^0[157]\d{8}$/)) newErrors.phoneNumber = "Numéro invalide (format 0XXXXXXXXX)";
    if (formData.serviceType === 'Crédit') {
      if (!formData.amount || Number(formData.amount) < 300) {
        newErrors.amount = "Minimum 300 FCFA";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setPage('payment');
    }
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      console.log("Commande enregistrée:", { ...formData, price: finalPrice, date: new Date().toISOString() });
      setTimeout(() => {
        setIsSubmitting(false);
        setPage('confirmation');
      }, 2000);
    } catch (error) {
      alert("Erreur lors de la validation.");
      setIsSubmitting(false);
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 blue-gradient rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl">
        <Zap size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">GoCredit</h1>
      <p className="text-blue-600 font-bold text-lg mb-2">Recharge rapide, paiement mobile sécurisé</p>
      <p className="text-slate-500 max-w-xs mb-10 leading-relaxed">
        Achetez votre crédit ou data mobile en quelques clics depuis votre téléphone.
      </p>
      <button 
        onClick={() => setPage('order')}
        className="w-full max-w-sm blue-gradient text-white py-5 rounded-2xl font-bold text-lg btn-shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
      >
        Commander maintenant <ChevronRight size={20} />
      </button>
      <div className="mt-12 flex items-center gap-8 px-4">
        {OPERATORS.map(op => (
          <div key={op.id} className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <img src={op.logo} alt={op.name} className="h-10 w-auto object-contain" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">{op.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrder = () => (
    <div className="max-w-md mx-auto p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <button onClick={() => setPage('home')} className="flex items-center gap-2 text-slate-500 mb-8 font-medium hover:text-blue-600 transition-colors">
        <ArrowLeft size={18} /> Retour
      </button>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Nouvelle Commande</h2>
      
      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Nom Complet */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom complet</label>
          <input 
            type="text" 
            placeholder="Ex: Jean Kouadio"
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
            className={`w-full p-4 bg-white border ${errors.fullName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'} rounded-2xl outline-none transition-all shadow-sm`}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.fullName}</p>}
        </div>

        {/* Numéro de téléphone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Numéro à recharger (CI)</label>
          <div className="relative">
            <input 
              type="tel" 
              placeholder="0XXXXXXXXX"
              value={formData.phoneNumber}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                setFormData({...formData, phoneNumber: val});
              }}
              className={`w-full p-4 bg-white border ${errors.phoneNumber ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'} rounded-2xl outline-none transition-all shadow-sm`}
            />
            <Smartphone className="absolute right-4 top-4 text-slate-300" size={20} />
          </div>
          <p className="text-[10px] text-slate-400 italic">Auto-détection: 01 (Moov), 05 (MTN), 07 (Orange)</p>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phoneNumber}</p>}
        </div>

        {/* Opérateur (Logos stylisés en couleur) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opérateur</label>
          <div className="grid grid-cols-3 gap-3">
            {OPERATORS.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setFormData({...formData, operator: op.id as Operator})}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] overflow-hidden ${
                  formData.operator === op.id 
                    ? `${op.activeBg} ${op.activeBorder} ${op.textColor} shadow-lg scale-105 z-10` 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 grayscale-0 opacity-100'
                }`}
              >
                <div className={`p-2 rounded-xl bg-white shadow-sm flex items-center justify-center w-full aspect-square`}>
                  <img src={op.logo} alt={op.name} className="h-10 w-auto object-contain" />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider`}>
                  {op.name}
                </span>
                {formData.operator === op.id && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 size={16} className={op.id === 'MTN' ? 'text-black' : 'text-white'} fill="currentColor" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type de service */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type de service</label>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {['Crédit', 'Data', 'Appel'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, serviceType: type as ServiceType})}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  formData.serviceType === type 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Champs Dynamiques */}
        {formData.serviceType === 'Crédit' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Montant (Min 300 FCFA)</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="Montant en FCFA"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className={`w-full p-4 bg-white border ${errors.amount ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'} rounded-2xl outline-none transition-all shadow-sm`}
              />
              <span className="absolute right-4 top-4 font-bold text-slate-400">FCFA</span>
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.amount}</p>}
          </div>
        )}

        {formData.serviceType === 'Data' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forfait Data</label>
            <div className="relative">
              <select 
                value={formData.dataPack}
                onChange={e => setFormData({...formData, dataPack: e.target.value})}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none font-bold text-slate-700"
              >
                {DATA_PACKS.map(p => (
                  <option key={p.label} value={p.label}>{p.label} — {p.price} FCFA</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>
        )}

        {formData.serviceType === 'Appel' && (
          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in duration-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
              <Phone size={20} />
            </div>
            <p className="text-blue-700 text-sm font-bold leading-tight">Forfait appel illimité 24H : <span className="block text-lg">500 FCFA</span></p>
          </div>
        )}

        {/* Prix Total et Validation */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total à payer</span>
            <span className="text-3xl font-black text-blue-600">{finalPrice.toLocaleString()} <span className="text-sm">FCFA</span></span>
          </div>
          <button 
            type="submit"
            className="w-full blue-gradient text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
          >
            Procéder au paiement <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderPayment = () => (
    <div className="max-w-md mx-auto p-6 animate-in slide-in-from-right-10 duration-500">
      <button onClick={() => setPage('order')} className="flex items-center gap-2 text-slate-500 mb-8 font-medium hover:text-blue-600 transition-colors">
        <ArrowLeft size={18} /> Modifier
      </button>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Récapitulatif</h2>
      <p className="text-slate-500 mb-8">Dernière étape avant la validation finale.</p>

      <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 space-y-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 blue-gradient opacity-5 rounded-bl-full"></div>
        
        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Destinataire</p>
              <p className="font-bold text-slate-800 text-lg">{formData.fullName}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Numéro</p>
              <p className="font-bold text-slate-800 text-lg">{formData.phoneNumber}</p>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Opérateur</p>
              <div className="flex items-center gap-2">
                <img src={OPERATORS.find(o => o.id === formData.operator)?.logo} className="h-5 w-auto" />
                <p className="font-black text-blue-600">{formData.operator}</p>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Service</p>
              <p className="font-bold text-slate-800">{formData.serviceType} {formData.serviceType === 'Data' ? `(${formData.dataPack})` : ''}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">Montant Final</span>
            <span className="text-3xl font-black text-blue-600">{finalPrice.toLocaleString()} FCFA</span>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleConfirmPayment}
          disabled={isSubmitting}
          className="w-full blue-gradient text-white py-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 transition-all"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Traitement sécurisé...
            </>
          ) : (
            <>Confirmer le paiement <ShieldCheck size={20} /></>
          )}
        </button>
        <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Agrégateur de paiement sécurisé</p>
            <div className="flex gap-4 items-center opacity-60">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Wave_Logo.svg" alt="Wave" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" alt="Orange" className="h-4" />
                <div className="text-[10px] font-black text-yellow-500">MTN MoMo</div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 shadow-inner">
        <CheckCircle2 size={56} />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Commande Confirmée !</h2>
      <p className="text-slate-600 mb-2 font-medium">Félicitations <span className="text-blue-600">{formData.fullName}</span> !</p>
      <p className="text-slate-500 max-w-xs mb-10 leading-relaxed">
        Votre recharge de {finalPrice} FCFA pour le numéro {formData.phoneNumber} est en cours de livraison. Prévoyez un délai de 5 minutes.
      </p>
      
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 text-left space-y-3">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-2">Résumé de transaction</p>
         <div className="flex justify-between text-sm"><span className="text-slate-500">Service:</span> <span className="font-bold text-slate-800">{formData.serviceType}</span></div>
         <div className="flex justify-between text-sm">
           <span className="text-slate-500">Opérateur:</span> 
           <div className="flex items-center gap-2">
             <img src={OPERATORS.find(o => o.id === formData.operator)?.logo} className="h-4 w-auto" />
             <span className="font-bold text-slate-800">{formData.operator}</span>
           </div>
         </div>
         <div className="flex justify-between text-sm"><span className="text-slate-500">Statut:</span> <span className="font-bold text-green-600">En cours de livraison</span></div>
         <div className="flex justify-between text-sm"><span className="text-slate-500">Date:</span> <span className="font-bold text-slate-800">{new Date().toLocaleDateString('fr-FR')}</span></div>
      </div>

      <button 
        onClick={() => {
            setFormData({fullName: '', phoneNumber: '', operator: 'MTN', serviceType: 'Crédit', amount: '', dataPack: DATA_PACKS[0].label});
            setPage('home');
        }}
        className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-xl"
      >
        Nouvelle commande
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto shadow-2xl bg-white lg:rounded-[3rem] lg:my-10 overflow-hidden relative border border-slate-100">
      {/* Barre de Navigation */}
      <nav className="sticky top-0 w-full z-40 glass-nav border-b border-slate-100 px-6 py-4">
        <div className="flex justify-between items-center">
          <div 
            onClick={() => setPage('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 blue-gradient rounded-xl flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform shadow-md">G</div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">GoCredit</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+2250564550796" className="p-2.5 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-all shadow-sm">
              <Phone size={20} />
            </a>
            <div className="text-[9px] font-black text-slate-500 border-2 border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest hidden sm:block bg-white shadow-sm">
              Service Client CI
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu Principal */}
      <main className="flex-grow">
        {page === 'home' && renderHome()}
        {page === 'order' && renderOrder()}
        {page === 'payment' && renderPayment()}
        {page === 'confirmation' && renderConfirmation()}
      </main>

      {/* Footer / Mentions Légales */}
      <footer className="p-10 text-center bg-slate-50/50 border-t border-slate-100">
        <div className="flex justify-center gap-4 mb-4 grayscale opacity-40">
           {OPERATORS.map(op => <img key={op.id} src={op.logo} className="h-6" alt={op.name} />)}
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">
          Paiement Centralisé & Livraison Instantanée
        </p>
        <p className="text-[10px] text-slate-400 italic leading-relaxed max-w-sm mx-auto">
          GoCredit est un service tiers indépendant. Les noms de marque et logos appartiennent à leurs opérateurs respectifs (MTN, Orange, Moov Africa).
        </p>
      </footer>

      {/* Bouton WhatsApp Flottant */}
      <a 
        href="https://wa.me/2250564550796?text=Bonjour%20GoCredit%2C%20je%20souhaite%20avoir%20des%20informations%20sur%20ma%20recharge." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          <div className="absolute -inset-3 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/40 transition-all"></div>
          <div className="w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-transform relative z-10 ring-4 ring-white">
            <MessageCircle size={32} />
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl text-[11px] font-black text-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 border border-slate-100">
            Aide & Support WhatsApp
          </div>
        </div>
      </a>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
