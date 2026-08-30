import React, { useState } from 'react';
import { X, Moon, Sun, Sparkles, Monitor, Palette, Trash2, LogOut, Check, User, ShieldCheck, Download, Brain, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const SettingsModal = ({ isOpen, onClose, onClearAllChats, onOpenMemory, onOpenThemeStudio }) => {
  const { user, logout } = useAuth();
  const { theme, currentThemePreset, accentColor } = useTheme();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[90vh] overflow-y-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Info Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md"
            style={{ backgroundColor: accentColor, color: '#33223B' }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              {user?.name || 'Guest User'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email || 'Guest Session'}</p>
          </div>
        </div>

        {/* Theme Studio Entry Card */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Visual Identity & Atmosphere
          </label>
          <div
            onClick={() => {
              onClose();
              if (onOpenThemeStudio) onOpenThemeStudio();
            }}
            className="p-4 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-black"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #FFFFFF)` }}
              >
                <Palette className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Theme Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                    {currentThemePreset?.name || 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Choose between Nebula, Daylight, Aurora, and Void atmospheres
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              Customize →
            </span>
          </div>
        </div>

        {/* Memory & Privacy Control */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Memory & Personalization
          </label>
          <button
            onClick={() => {
              onClose();
              if (onOpenMemory) onOpenMemory();
            }}
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-purple-500" />
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">
                  Manage Stored AI Memories
                </span>
                <span className="text-[10px] text-zinc-400">View, edit, or delete persistent preferences</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">View</span>
          </button>
        </div>

        {/* Multi-Subsystem Health & Status (Section 51 & 59) */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            System & Subsystem Status
          </label>
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-zinc-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">AI Intelligence Core</span>
              <span className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Image Generation Studio</span>
              <span className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Live Web Search Engine</span>
              <span className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">SQLite Database (WAL)</span>
              <span className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone: Clear Chats & Logout */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
          <div className="flex justify-between items-center">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-bold">Clear all history?</span>
                <button
                  onClick={() => {
                    onClearAllChats();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                >
                  Yes, Clear
                </button>
                <button onClick={() => setConfirmClear(false)} className="px-2 py-1 text-xs text-zinc-400">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
