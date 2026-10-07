import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { parseRupeeAmount } from '../utils/parser';
import { Language, UI_TEXT } from '../utils/i18n';

interface InputScreenProps {
  onAnalyze: (rawText: string, file: File | null, openingBalance: number | null) => void;
  onLoadDemo: () => void;
  onLoadMalayalamDemo: () => void;
  isLoading: boolean;
  language: Language;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  onAnalyze,
  onLoadDemo,
  onLoadMalayalamDemo,
  isLoading,
  language,
}) => {
  const t = UI_TEXT[language];
  const [activeMode, setActiveMode] = useState<'paste' | 'upload'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMsg("⚠ I couldn't read this file. Please upload an XLSX, XLS, or CSV file.");
      return;
    }

    setUploadedFile(file);
    setActiveMode('upload');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    const openingBalance = openingBalanceStr.trim()
      ? parseRupeeAmount(openingBalanceStr)
      : null;

    if (activeMode === 'paste') {
      if (!pasteContent.trim()) {
        setErrorMsg(
          "I couldn't find recognizable income or expense entries. Try pasting entries such as: Petrol - ₹500 or Client payment - ₹10,000."
        );
        return;
      }
      onAnalyze(pasteContent, null, openingBalance);
    } else {
      if (!uploadedFile) {
        setErrorMsg('Please select an Excel or CSV file to upload.');
        return;
      }
      onAnalyze('', uploadedFile, openingBalance);
    }
  };

  const placeholderText =
    language === 'ml'
      ? `01/10/2026
ക്ലയന്റ് അഡ്വാൻസ് പേയ്‌മെന്റ് - 35000
കട വാടക - 15000
പെട്രോൾ - 750
ചായയും പലഹാരവും - 140
ഇന്നത്തെ കച്ചവടം (UPI & Cash) - 12400
പാക്കിംഗ് ബോക്സുകൾ വാങ്ങിയത് - 2800
സ്റ്റോക്ക് സാധനങ്ങൾ എടുത്തത് - 18500
സ്റ്റാഫ് ശമ്പള അഡ്വാൻസ് - 5000
കടയിലെ കറന്റ് ബിൽ കെഎസ്ഇബി - 3200
ഫേസ്ബുക്ക് ഇൻസ്റ്റാഗ്രാം പരസ്യം - 2500
വെബ്സൈറ്റ് വർക്ക് ബാക്കി പണം - 24000
വീട്ടുചെലവിന് എടുത്തത് - 8000
കുട്ടിയുടെ സ്കൂൾ ഫീസ് - 4500`
      : `01/10/2026
Client payment - 15000
Petrol - 800
Tea - 120
Shop rent - 12000
Instagram ads - 2500
Counter sales: 8.5k
Bought raw material: 4200
Assistant salary - 14k
1.2k swiggy dinner
UPI to supplier - 5600
Personal withdrawal home expense - 5000`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Welcome */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'ml' ? 'ലളിതമായ ബിസിനസ്സ് ക്യാഷ്-ഫ്ലോ മാനേജ്മെന്റ്' : 'Simple Cash-Flow Management for Indian Businesses'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.welcomeHeadline}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.welcomeSub}
        </p>

        {/* Quick Demo CTAs: Both Malayalam & English options */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onLoadMalayalamDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 border border-emerald-300 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{t.tryDemoMl}</span>
          </button>
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{t.tryDemoEn}</span>
          </button>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Method Toggle Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveMode('paste')}
            className={`flex-1 py-3.5 px-4 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              activeMode === 'paste'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.pasteTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-3.5 px-4 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              activeMode === 'upload'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.uploadTab}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Paste Section */}
          {activeMode === 'paste' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.pasteLabel}
                </label>
                <span className="text-xs text-slate-400">
                  {t.pasteHelper}
                </span>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={placeholderText}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 font-mono text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-y"
              />
            </div>
          ) : (
            /* Upload Section */
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Upload your transaction spreadsheet
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : uploadedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-bold text-slate-900">{uploadedFile.name}</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to analyze ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Click to replace file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drag and drop your spreadsheet here, or{' '}
                      <span className="text-blue-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload transactions</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Opening Balance */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-slate-500">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <label htmlFor="opening-balance-input" className="block text-sm font-bold text-slate-900">
                    {t.openingBalanceLabel}
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.openingBalanceHelp}
                  </p>
                </div>
              </div>
              <div className="relative sm:w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="opening-balance-input"
                  type="text"
                  value={openingBalanceStr}
                  onChange={(e) => setOpeningBalanceStr(e.target.value)}
                  placeholder="e.g. 25,000"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{t.analyzeBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust & normalization highlights */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="font-semibold text-xs text-blue-700 flex items-center gap-1.5 justify-center sm:justify-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Smart Auto-Cleaner</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Understands messy entries: "15k client", "1.2k petrol", "₹120 chai", commas, and UPI notes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="font-semibold text-xs text-blue-700 flex items-center gap-1.5 justify-center sm:justify-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Math</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Calculations are 100% computed in code. No hallucinations or fuzzy arithmetic on your rupee numbers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="font-semibold text-xs text-blue-700 flex items-center gap-1.5 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Strict Privacy</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Never asks for bank logins, OTPs, or UPI PINs. Only processes the transaction notes you supply.
          </p>
        </div>
      </div>
    </div>
  );
};
