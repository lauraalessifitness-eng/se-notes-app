"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";

// ─── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:     #FAF8F4;
    --parchment: #F2EDE4;
    --warm-mid:  #E8DFD0;
    --warm-dark: #C8B99A;
    --ink:       #2C2825;
    --ink-mid:   #5C5047;
    --ink-light: #9A8E82;
    --sage:      #7A9E8E;
    --sage-light:#A8C4B8;
    --rose:      #C4857A;
    --rose-light:#DDB5AF;
    --gold:      #B89A5A;
    --shadow:    rgba(44,40,37,0.08);
    --radius:    14px;
    --radius-sm: 8px;
    --sidebar-w: 300px;
  }

  html, body {
    height: 100%;
    background: var(--cream);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
  }

  .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  /* ── Header ── */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px 14px;
    border-bottom: 1px solid var(--warm-mid);
    flex-shrink: 0; background: var(--cream);
  }
  .header-left h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500; font-size: 26px; letter-spacing: 0.01em; color: var(--ink);
  }
  .header-left p {
    font-size: 11px; color: var(--ink-light); letter-spacing: 0.06em;
    text-transform: uppercase; margin-top: 2px;
  }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .date-badge {
    font-size: 12px; color: var(--ink-mid); background: var(--parchment);
    border: 1px solid var(--warm-mid); border-radius: 20px;
    padding: 5px 14px; letter-spacing: 0.04em;
  }

  /* ── Page tabs (top-level nav) ── */
  .page-tabs {
    display: flex; gap: 0; padding: 0 32px;
    flex-shrink: 0; background: var(--cream);
    border-bottom: 1px solid var(--warm-mid);
  }
  .page-tab {
    padding: 10px 20px 9px;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 400; color: var(--ink-light);
    border-bottom: 2px solid transparent;
    transition: all 0.18s; letter-spacing: 0.02em;
    position: relative; top: 1px;
  }
  .page-tab:hover { color: var(--ink-mid); }
  .page-tab.active {
    color: var(--ink); font-weight: 500;
    border-bottom-color: var(--ink);
  }

  /* ── Day tabs ── */
  .day-tabs {
    display: flex; gap: 5px; padding: 12px 32px 0;
    overflow-x: auto; scrollbar-width: none;
    flex-shrink: 0; background: var(--cream);
  }
  .day-tabs::-webkit-scrollbar { display: none; }
  .day-tab {
    flex-shrink: 0; padding: 7px 16px;
    border-radius: 20px; border: 1px solid var(--warm-mid);
    background: transparent; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    font-weight: 400; color: var(--ink-mid);
    transition: all 0.18s ease;
  }
  .day-tab:hover { background: var(--parchment); color: var(--ink); }
  .day-tab.active { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .day-tab.has-flag::after {
    content: ''; display: inline-block;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--rose); margin-left: 6px;
    vertical-align: middle; position: relative; top: -1px;
  }

  /* ── Content area ── */
  .content-area {
    display: flex; flex: 1; min-height: 0;
    padding: 16px 32px 20px; gap: 20px;
  }

  /* ── Journal ── */
  .journal {
    flex: 1; min-width: 0; display: flex; flex-direction: column;
    background: white; border-radius: var(--radius);
    border: 1px solid var(--warm-mid);
    box-shadow: 0 4px 24px var(--shadow), 0 1px 4px rgba(44,40,37,0.04);
    overflow: hidden;
  }
  .journal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 28px 14px;
    border-bottom: 1px solid var(--parchment); flex-shrink: 0;
  }
  .journal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 500; color: var(--ink); letter-spacing: 0.01em;
  }
  .journal-meta { font-size: 11px; color: var(--ink-light); letter-spacing: 0.04em; }

  /* ── Toolbar ── */
  .editor-toolbar {
    display: flex; align-items: center; gap: 2px;
    padding: 8px 28px; border-bottom: 1px solid var(--parchment);
    flex-shrink: 0; background: #FDFCFA;
  }
  .toolbar-btn {
    background: none; border: 1px solid transparent;
    border-radius: 6px; cursor: pointer;
    padding: 5px 8px; font-size: 13px;
    color: var(--ink-mid); transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; line-height: 1;
  }
  .toolbar-btn:hover { background: var(--parchment); color: var(--ink); }
  .toolbar-btn.active { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .toolbar-divider { width: 1px; height: 18px; background: var(--warm-mid); margin: 0 6px; }

  /* ── Tiptap editor ── */
  .editor-scroll {
    flex: 1; overflow-y: auto; padding: 32px 40px 48px; min-height: 0;
  }
  .editor-scroll::-webkit-scrollbar { width: 5px; }
  .editor-scroll::-webkit-scrollbar-track { background: transparent; }
  .editor-scroll::-webkit-scrollbar-thumb { background: var(--warm-mid); border-radius: 3px; }
  .editor-scroll .tiptap {
    outline: none; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 300; line-height: 1.9;
    color: var(--ink); min-height: 70vh; max-width: 680px;
  }
  .editor-scroll .tiptap p { margin-bottom: 0.6em; }
  .editor-scroll .tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder); color: var(--warm-dark);
    float: left; height: 0; pointer-events: none; white-space: pre-wrap;
  }
  .editor-scroll .tiptap ul,
  .editor-scroll .tiptap ol { padding-left: 1.5em; margin-bottom: 0.6em; }
  .editor-scroll .tiptap blockquote {
    border-left: 3px solid var(--warm-mid);
    padding-left: 16px; margin: 0.6em 0; color: var(--ink-mid); font-style: italic;
  }

  /* ── Trigger flag ── */
  .trigger-section {
    border-top: 1px solid var(--parchment);
    padding: 12px 28px 14px; background: #FDF9F8; flex-shrink: 0;
  }
  .trigger-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .trigger-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px; font-weight: 500; color: var(--rose); letter-spacing: 0.02em;
  }
  .trigger-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rose-light); flex-shrink: 0; }
  .trigger-dot.active { background: var(--rose); }
  .trigger-note-area {
    width: 100%; resize: none; border: 1px solid var(--rose-light);
    border-radius: var(--radius-sm); padding: 8px 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 300; line-height: 1.6; color: var(--ink);
    background: white; outline: none; min-height: 60px;
    transition: border-color 0.15s;
  }
  .trigger-note-area:focus { border-color: var(--rose); }
  .trigger-note-area::placeholder { color: var(--rose-light); }
  .trigger-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
  .toggle-pill {
    width: 34px; height: 18px; border-radius: 9px;
    background: var(--warm-mid); position: relative;
    transition: background 0.2s; flex-shrink: 0;
  }
  .toggle-pill.on { background: var(--rose); }
  .toggle-knob {
    position: absolute; top: 2px; left: 2px;
    width: 14px; height: 14px; border-radius: 50%;
    background: white; transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  .toggle-pill.on .toggle-knob { transform: translateX(16px); }
  .toggle-text { font-size: 12px; color: var(--ink-mid); }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w); flex-shrink: 0;
    display: flex; flex-direction: column; gap: 14px; min-height: 0;
  }
  .sidebar-panel {
    background: white; border: 1px solid var(--warm-mid);
    border-radius: var(--radius); display: flex; flex-direction: column;
    overflow: hidden; box-shadow: 0 2px 10px var(--shadow);
  }
  .sidebar-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px 10px; border-bottom: 1px solid var(--parchment);
  }
  .sidebar-panel-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px; font-weight: 500; color: var(--ink); letter-spacing: 0.02em;
  }
  .sidebar-panel-body { padding: 12px 16px; overflow-y: auto; }
  .sidebar-panel-body::-webkit-scrollbar { width: 3px; }
  .sidebar-panel-body::-webkit-scrollbar-track { background: transparent; }
  .sidebar-panel-body::-webkit-scrollbar-thumb { background: var(--warm-mid); border-radius: 2px; }

  /* ── Upload / slides shared ── */
  .upload-zone {
    border: 1.5px dashed var(--warm-dark); border-radius: var(--radius-sm);
    padding: 16px 14px; text-align: center; cursor: pointer;
    transition: all 0.18s; background: var(--parchment);
  }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--sage); background: #EFF5F2; }
  .upload-icon { font-size: 16px; margin-bottom: 4px; opacity: 0.5; }
  .upload-text { font-size: 12px; color: var(--ink-mid); line-height: 1.5; }
  .upload-text strong { color: var(--sage); font-weight: 500; }
  .upload-input { display: none; }

  .slide-list, .doc-list { display: flex; flex-direction: column; gap: 6px; }
  .slide-item, .doc-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: var(--radius-sm);
    background: var(--parchment); border: 1px solid var(--warm-mid);
  }
  .slide-icon, .doc-icon { font-size: 15px; flex-shrink: 0; }
  .slide-info, .doc-info { flex: 1; min-width: 0; }
  .slide-name, .doc-name { font-size: 12px; font-weight: 400; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .slide-size, .doc-size { font-size: 10px; color: var(--ink-light); margin-top: 1px; }
  .slide-remove, .doc-remove {
    background: none; border: none; cursor: pointer;
    color: var(--ink-light); font-size: 14px; padding: 2px 4px;
    border-radius: 4px; transition: color 0.15s; flex-shrink: 0; line-height: 1;
  }
  .slide-remove:hover, .doc-remove:hover { color: var(--rose); }

  /* ── Summary ── */
  .summary-sidebar { flex: 1; min-height: 0; }
  .summary-sidebar .sidebar-panel-body { flex: 1; overflow-y: auto; }
  .summary-empty {
    text-align: center; padding: 20px 10px;
    color: var(--ink-light); font-size: 12px; line-height: 1.7;
  }
  .summary-empty .empty-icon { font-size: 22px; margin-bottom: 8px; opacity: 0.4; }
  .summary-block { margin-bottom: 12px; }
  .summary-block-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 12px; font-weight: 600; color: var(--ink-mid);
    letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;
  }
  .summary-block-content { font-size: 12px; line-height: 1.65; color: var(--ink); white-space: pre-wrap; }
  .summary-trigger-block {
    background: #FFF5F4; border: 1px solid var(--rose-light);
    border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 10px;
  }
  .summary-trigger-label {
    font-size: 10px; font-weight: 500; color: var(--rose);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px;
  }
  .summary-trigger-text { font-size: 12px; color: var(--ink-mid); line-height: 1.6; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 20px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    font-weight: 400; cursor: pointer; transition: all 0.18s; letter-spacing: 0.02em;
  }
  .btn-ghost { background: transparent; color: var(--ink-mid); border: 1px solid var(--warm-mid); }
  .btn-ghost:hover { background: var(--parchment); }
  .btn-sage { background: var(--sage); color: white; }
  .btn-sage:hover { background: #6A8E7E; }
  .btn-ink { background: var(--ink); color: var(--cream); }
  .btn-ink:hover { background: var(--ink-mid); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-sm { padding: 4px 10px; font-size: 11px; }

  /* ── Loading ── */
  .loading-dots span {
    display: inline-block; width: 4px; height: 4px;
    border-radius: 50%; background: var(--sage);
    margin: 0 2px; animation: bounce 1s infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-5px); opacity: 1; }
  }

  /* ════════════════════════════════════════════════════════════════════════════
     Requirements & Admin page
     ════════════════════════════════════════════════════════════════════════════ */
  .admin-content {
    flex: 1; overflow-y: auto;
    padding: 24px 32px 32px;
    min-height: 0;
  }
  .admin-content::-webkit-scrollbar { width: 5px; }
  .admin-content::-webkit-scrollbar-track { background: transparent; }
  .admin-content::-webkit-scrollbar-thumb { background: var(--warm-mid); border-radius: 3px; }

  .admin-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    max-width: 1000px;
  }

  .admin-panel {
    background: white; border: 1px solid var(--warm-mid);
    border-radius: var(--radius); overflow: hidden;
    box-shadow: 0 2px 12px var(--shadow);
    display: flex; flex-direction: column;
  }
  .admin-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 14px; border-bottom: 1px solid var(--parchment);
    flex-shrink: 0;
  }
  .admin-panel-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 500; color: var(--ink); letter-spacing: 0.01em;
  }
  .admin-panel-body { padding: 16px 20px; overflow-y: auto; }

  /* ── Checklist ── */
  .checklist-progress {
    font-size: 13px; color: var(--ink-mid); margin-bottom: 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .progress-bar-bg {
    flex: 1; height: 4px; background: var(--parchment);
    border-radius: 2px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; background: var(--sage);
    border-radius: 2px; transition: width 0.3s ease;
  }
  .progress-text { flex-shrink: 0; font-size: 12px; letter-spacing: 0.03em; }

  .checklist { display: flex; flex-direction: column; gap: 0; }
  .checklist-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid var(--parchment);
    transition: opacity 0.2s;
  }
  .checklist-item:last-child { border-bottom: none; }
  .checklist-item.done { opacity: 0.45; }
  .checklist-item.done .checklist-item-text {
    text-decoration: line-through; color: var(--ink-light);
  }

  .checklist-checkbox {
    width: 18px; height: 18px; border-radius: 4px;
    border: 1.5px solid var(--warm-dark); background: white;
    cursor: pointer; flex-shrink: 0; margin-top: 1px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; appearance: none; -webkit-appearance: none;
  }
  .checklist-checkbox:checked {
    background: var(--sage); border-color: var(--sage);
  }
  .checklist-checkbox:checked::after {
    content: ''; display: block;
    width: 5px; height: 9px;
    border: solid white; border-width: 0 2px 2px 0;
    transform: rotate(45deg); margin-top: -1px;
  }

  .checklist-item-text {
    flex: 1; font-size: 14px; line-height: 1.5; color: var(--ink);
    font-weight: 300; min-width: 0;
  }
  .checklist-item-remove {
    background: none; border: none; cursor: pointer;
    color: var(--warm-dark); font-size: 14px; padding: 0 2px;
    transition: color 0.15s; flex-shrink: 0; line-height: 1;
    opacity: 0; transition: opacity 0.15s, color 0.15s;
  }
  .checklist-item:hover .checklist-item-remove { opacity: 1; }
  .checklist-item-remove:hover { color: var(--rose); }

  .checklist-add {
    display: flex; gap: 8px; margin-top: 14px;
  }
  .checklist-input {
    flex: 1; border: 1px solid var(--warm-mid); border-radius: 20px;
    padding: 8px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 300; color: var(--ink);
    outline: none; background: white; transition: border-color 0.15s;
  }
  .checklist-input:focus { border-color: var(--sage); }
  .checklist-input::placeholder { color: var(--warm-dark); }

  .checklist-empty {
    text-align: center; padding: 28px 16px;
    color: var(--ink-light); font-size: 13px; line-height: 1.7;
  }
  .checklist-empty .empty-icon { font-size: 22px; margin-bottom: 6px; opacity: 0.35; }

  /* ── Admin docs upload ── */
  .admin-upload-zone {
    border: 1.5px dashed var(--warm-dark); border-radius: var(--radius-sm);
    padding: 24px 16px; text-align: center; cursor: pointer;
    transition: all 0.18s; background: var(--parchment);
  }
  .admin-upload-zone:hover, .admin-upload-zone.drag-over {
    border-color: var(--sage); background: #EFF5F2;
  }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .content-area { flex-direction: column; padding: 12px 16px 16px; }
    .sidebar { width: 100%; flex-direction: row; gap: 12px; }
    .sidebar-panel { flex: 1; min-width: 0; }
    .journal { min-height: 400px; }
    .admin-grid { grid-template-columns: 1fr; }
    .admin-content { padding: 16px; }
  }
`;

// ─── Config ─────────────────────────────────────────────────────────────────
const DAYS = [
  { id: "mar12", label: "Mar 12", full: "Thursday, March 12" },
  { id: "mar13", label: "Mar 13", full: "Friday, March 13" },
  { id: "mar14", label: "Mar 14", full: "Saturday, March 14" },
  { id: "mar15", label: "Mar 15", full: "Saturday, March 15" },
  { id: "mar16", label: "Mar 16", full: "Sunday, March 16" },
  { id: "mar17", label: "Mar 17", full: "Monday, March 17" },
];

interface DayData {
  notes: string;
  triggerActive: boolean;
  triggerNote: string;
  slides: { name: string; size: number; file: File; id: string }[];
  summary: string | null;
  generating: boolean;
}
interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}
interface AdminDoc {
  id: string;
  name: string;
  size: number;
  file: File;
}

const EMPTY_DAY = (): DayData => ({
  notes: "", triggerActive: false, triggerNote: "",
  slides: [], summary: null, generating: false,
});

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

const FONT_COLORS = [
  { label: "Default", value: "#2C2825" },
  { label: "Rose", value: "#C4857A" },
  { label: "Sage", value: "#7A9E8E" },
  { label: "Gold", value: "#B89A5A" },
  { label: "Ink Light", value: "#9A8E82" },
  { label: "Blue", value: "#5B7FA5" },
  { label: "Purple", value: "#8B6FAE" },
];

function uid() { return Math.random().toString(36).slice(2); }

// ─── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEYS = {
  days: "se-app-days",
  checklist: "se-app-checklist",
  adminDocsMeta: "se-app-admin-docs",
};

interface SaveableDayData {
  notes: string;
  triggerActive: boolean;
  triggerNote: string;
  slidesMeta: { name: string; size: number; id: string }[];
  summary: string | null;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Toolbar ────────────────────────────────────────────────────────────────
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;
  return (
    <div className="editor-toolbar">
      <button className={`toolbar-btn${editor.isActive("bold") ? " active" : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Cmd+B)">
        <strong>B</strong>
      </button>
      <button className={`toolbar-btn${editor.isActive("italic") ? " active" : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Cmd+I)">
        <em>I</em>
      </button>
      <button className={`toolbar-btn${editor.isActive("underline") ? " active" : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Cmd+U)">
        <span style={{ textDecoration: "underline" }}>U</span>
      </button>
      <div className="toolbar-divider" />
      <button className={`toolbar-btn${editor.isActive("bulletList") ? " active" : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        &bull; List
      </button>
      <button className={`toolbar-btn${editor.isActive("blockquote") ? " active" : ""}`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
        &ldquo; Quote
      </button>
      <div className="toolbar-divider" />
      <select className="toolbar-btn" style={{ cursor: "pointer", paddingRight: 4 }}
        value={FONT_COLORS.find((c) => editor.isActive("textStyle", { color: c.value }))?.value || "#2C2825"}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "#2C2825") editor.chain().focus().unsetColor().run();
          else editor.chain().focus().setColor(val).run();
        }}>
        {FONT_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function SENotesApp() {
  const [activePage, setActivePage] = useState<"notes" | "admin">("notes");
  const [activeDay, setActiveDay] = useState("mar12");
  const [days, setDays] = useState<Record<string, DayData>>(() => {
    const saved = loadFromStorage<Record<string, SaveableDayData> | null>(STORAGE_KEYS.days, null);
    if (saved) {
      const restored: Record<string, DayData> = {};
      for (const d of DAYS) {
        const s = saved[d.id];
        if (s) {
          restored[d.id] = {
            notes: s.notes, triggerActive: s.triggerActive,
            triggerNote: s.triggerNote, summary: s.summary,
            slides: (s.slidesMeta || []).map((m) => ({ ...m, file: null as unknown as File })),
            generating: false,
          };
        } else {
          restored[d.id] = EMPTY_DAY();
        }
      }
      return restored;
    }
    return Object.fromEntries(DAYS.map((d) => [d.id, EMPTY_DAY()]));
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Admin state
  const [adminDocs, setAdminDocs] = useState<AdminDoc[]>(() => {
    const saved = loadFromStorage<{ name: string; size: number; id: string }[]>(STORAGE_KEYS.adminDocsMeta, []);
    return saved.map((m) => ({ ...m, file: null as unknown as File }));
  });
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    loadFromStorage<ChecklistItem[]>(STORAGE_KEYS.checklist, [])
  );
  const [newTask, setNewTask] = useState("");
  const [adminDragOver, setAdminDragOver] = useState(false);
  const adminFileRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);

  const day = days[activeDay];
  const setDay = useCallback(
    (patch: Partial<DayData> | ((d: DayData) => Partial<DayData>)) =>
      setDays((prev) => ({
        ...prev,
        [activeDay]: { ...prev[activeDay], ...(typeof patch === "function" ? patch(prev[activeDay]) : patch) },
      })),
    [activeDay]
  );

  // ── Persist state to localStorage ──
  useEffect(() => {
    const saveable: Record<string, SaveableDayData> = {};
    for (const [id, d] of Object.entries(days)) {
      saveable[id] = {
        notes: d.notes,
        triggerActive: d.triggerActive,
        triggerNote: d.triggerNote,
        summary: d.summary,
        slidesMeta: d.slides.map((s) => ({ name: s.name, size: s.size, id: s.id })),
      };
    }
    saveToStorage(STORAGE_KEYS.days, saveable);
  }, [days]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.checklist, checklist);
  }, [checklist]);

  useEffect(() => {
    const meta = adminDocs.map((d) => ({ name: d.name, size: d.size, id: d.id }));
    saveToStorage(STORAGE_KEYS.adminDocsMeta, meta);
  }, [adminDocs]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit, Underline, TextStyle, Color,
      Placeholder.configure({
        placeholder: "Begin typing your lecture notes here…\n\nConcepts, observations, questions, client applications — anything that surfaces as you learn.",
      }),
    ],
    content: day.notes,
    onUpdate: ({ editor: ed }) => { setDay({ notes: ed.getHTML() }); },
  });

  const prevDayRef = useRef(activeDay);
  if (prevDayRef.current !== activeDay) {
    prevDayRef.current = activeDay;
    if (editor) editor.commands.setContent(days[activeDay].notes || "");
  }

  // ── Slide files ──
  const handleFiles = (files: FileList) => {
    const newSlides = Array.from(files)
      .filter((f) => f.name.match(/\.(pptx|ppt|pdf)$/i))
      .map((f) => ({ name: f.name, size: f.size, file: f, id: uid() }));
    if (newSlides.length) setDay((d) => ({ slides: [...d.slides, ...newSlides] }));
  };
  const removeSlide = (id: string) => setDay((d) => ({ slides: d.slides.filter((s) => s.id !== id) }));

  // ── Admin doc files ──
  const handleAdminFiles = (files: FileList) => {
    const newDocs = Array.from(files)
      .filter((f) => f.name.match(/\.(pdf|png|jpg|jpeg|gif|webp)$/i))
      .map((f) => ({ name: f.name, size: f.size, file: f, id: uid() }));
    if (newDocs.length) setAdminDocs((prev) => [...prev, ...newDocs]);
  };
  const removeDoc = (id: string) => setAdminDocs((prev) => prev.filter((d) => d.id !== id));

  // ── Checklist ──
  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { id: uid(), text, done: false }]);
    setNewTask("");
  };
  const toggleTask = (id: string) =>
    setChecklist((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) =>
    setChecklist((prev) => prev.filter((t) => t.id !== id));

  const completedCount = checklist.filter((t) => t.done).length;
  const totalCount = checklist.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ── Generate task list from docs ──
  const generateTaskList = async () => {
    setExtracting(true);
    const docNames = adminDocs.map((d) => d.name).join(", ");
    const prompt = `You are helping a therapist manage their Somatic Experiencing (SE) training requirements.

They have uploaded the following admin documents: ${docNames || "None"}

Based on typical SE training administrative requirements (attendance forms, case notes, supervision logs, signed agreements, payment receipts, evaluations, etc.), generate a list of likely action items and requirements the therapist needs to complete.

Return ONLY a JSON array of strings, each being a concise task description. Example format:
["Submit signed training agreement", "Complete daily attendance form", "Submit 3 practice session case notes"]

Return 5-10 realistic items. Return ONLY the JSON array, no other text.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c: { text?: string }) => c.text || "").join("") || "[]";
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const tasks: string[] = JSON.parse(match[0]);
        const newItems = tasks.map((t) => ({ id: uid(), text: t, done: false }));
        setChecklist((prev) => [...prev, ...newItems]);
      }
    } catch {
      // silently fail
    }
    setExtracting(false);
  };

  // ── Generate summary ──
  const generateSummary = async () => {
    setDay({ generating: true, summary: null });
    const currentDay = days[activeDay];
    const dayInfo = DAYS.find((d) => d.id === activeDay);
    const plainNotes = currentDay.notes.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const prompt = `You are helping a therapist summarize their Somatic Experiencing (SE) training module notes.

Day: ${dayInfo?.full}
Slides uploaded: ${currentDay.slides.map((s) => s.name).join(", ") || "None"}
Trigger flag: ${currentDay.triggerActive ? "YES — therapist flagged something triggering" : "No"}
Trigger note: ${currentDay.triggerActive && currentDay.triggerNote ? currentDay.triggerNote : "N/A"}

Lecture notes:
${plainNotes || "(No notes yet)"}

Please create a clean, structured summary with these sections:
1. KEY CONCEPTS — main somatic experiencing concepts covered
2. CLINICAL INSIGHTS — practical takeaways for clinical work
3. PERSONAL REFLECTIONS — any personal observations from the notes
${currentDay.triggerActive ? "4. FOR THERAPIST REVIEW — a gentle summary of what was flagged as triggering, written compassionately for sharing with their own therapist" : ""}

Keep the tone warm, professional, and grounded. Be concise but thorough.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c: { text?: string }) => c.text || "").join("") || "Unable to generate summary.";
      setDay({ generating: false, summary: text });
    } catch {
      setDay({ generating: false, summary: "Error generating summary. Please try again." });
    }
  };

  const parseSummary = (text: string) => {
    if (!text) return [];
    const sections: { title: string; body: string }[] = [];
    const lines = text.split("\n");
    let current: { title: string; body: string } | null = null;
    for (const line of lines) {
      const heading = line.match(/^\*?\*?(\d+\.\s+)?([A-Z][A-Z\s]+[A-Z])\*?\*?[:—]?\s*$/);
      if (heading) { if (current) sections.push(current); current = { title: heading[2].trim(), body: "" }; }
      else if (current) current.body += line + "\n";
    }
    if (current) sections.push(current);
    return sections.length ? sections : [{ title: "SUMMARY", body: text }];
  };

  const hasFlag = (id: string) => days[id]?.triggerActive;
  const dayLabel = DAYS.find((d) => d.id === activeDay)?.full || "";
  const wordCount = day.notes.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

  // Sort checklist: incomplete first, then completed
  const sortedChecklist = [...checklist].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="app">
        {/* ── Header ── */}
        <header className="header">
          <div className="header-left">
            <h1>Somatic Experiencing</h1>
            <p>Advanced Module · San Francisco · March 2026</p>
          </div>
          <div className="header-right">
            <span className="date-badge">{dayLabel}</span>
          </div>
        </header>

        {/* ── Page tabs ── */}
        <nav className="page-tabs">
          <button className={`page-tab${activePage === "notes" ? " active" : ""}`}
            onClick={() => setActivePage("notes")}>
            Lecture Notes
          </button>
          <button className={`page-tab${activePage === "admin" ? " active" : ""}`}
            onClick={() => setActivePage("admin")}>
            Requirements & Admin
          </button>
        </nav>

        {/* ════════════════════════════════════════════════════════════════════
            LECTURE NOTES PAGE
            ════════════════════════════════════════════════════════════════════ */}
        {activePage === "notes" && (
          <>
            <nav className="day-tabs">
              {DAYS.map((d) => (
                <button key={d.id}
                  className={`day-tab${activeDay === d.id ? " active" : ""}${hasFlag(d.id) ? " has-flag" : ""}`}
                  onClick={() => setActiveDay(d.id)}>
                  {d.label}
                </button>
              ))}
            </nav>
            <div className="content-area">
              <div className="journal">
                <div className="journal-header">
                  <span className="journal-title">Lecture Notes</span>
                  <span className="journal-meta">{wordCount > 0 ? `${wordCount} words` : ""}</span>
                </div>
                <EditorToolbar editor={editor} />
                <div className="editor-scroll">
                  <EditorContent editor={editor} />
                </div>
                <div className="trigger-section">
                  <div className="trigger-header">
                    <div className={`trigger-dot${day.triggerActive ? " active" : ""}`} />
                    <span className="trigger-label">Therapist Self-Care Flag</span>
                  </div>
                  <div className="trigger-toggle"
                    onClick={() => setDay({ triggerActive: !day.triggerActive })}
                    style={{ marginBottom: day.triggerActive ? 8 : 0 }}>
                    <div className={`toggle-pill${day.triggerActive ? " on" : ""}`}>
                      <div className="toggle-knob" />
                    </div>
                    <span className="toggle-text">
                      {day.triggerActive ? "Something came up — flagged for therapist" : "Flag something that arose today"}
                    </span>
                  </div>
                  {day.triggerActive && (
                    <textarea className="trigger-note-area"
                      placeholder="Describe what came up for you — this will be included privately in your summary for sharing with your therapist…"
                      value={day.triggerNote} onChange={(e) => setDay({ triggerNote: e.target.value })} />
                  )}
                </div>
              </div>

              <aside className="sidebar">
                <div className="sidebar-panel">
                  <div className="sidebar-panel-header">
                    <span className="sidebar-panel-title">Slide Decks</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>+ Add</button>
                  </div>
                  <div className="sidebar-panel-body">
                    <input ref={fileInputRef} type="file" className="upload-input" accept=".pptx,.ppt,.pdf" multiple
                      onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                    {day.slides.length === 0 ? (
                      <div className={`upload-zone${dragOver ? " drag-over" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}>
                        <div className="upload-icon">📎</div>
                        <div className="upload-text"><strong>Upload slide decks</strong><br />.pptx · .ppt · .pdf</div>
                      </div>
                    ) : (
                      <>
                        <div className="slide-list">
                          {day.slides.map((s) => (
                            <div key={s.id} className="slide-item">
                              <span className="slide-icon">🗂</span>
                              <div className="slide-info">
                                <div className="slide-name">{s.name}</div>
                                <div className="slide-size">{fmtBytes(s.size)}</div>
                              </div>
                              <button className="slide-remove" onClick={() => removeSlide(s.id)}>×</button>
                            </div>
                          ))}
                        </div>
                        <div className="upload-zone" style={{ marginTop: 8, padding: "10px 12px" }}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}>
                          <div className="upload-text" style={{ fontSize: 11 }}>+ Add another deck</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="sidebar-panel summary-sidebar">
                  <div className="sidebar-panel-header">
                    <span className="sidebar-panel-title">Daily Summary</span>
                    <button className="btn btn-sage btn-sm" onClick={generateSummary}
                      disabled={day.generating || (!day.notes && !day.slides.length)}>
                      {day.generating ? <span className="loading-dots"><span /><span /><span /></span> : "✦ Generate"}
                    </button>
                  </div>
                  <div className="sidebar-panel-body">
                    {!day.summary && !day.generating && (
                      <div className="summary-empty">
                        <div className="empty-icon">✦</div>
                        Add notes or slides, then<br /><strong style={{ color: "var(--sage)" }}>Generate</strong> your summary
                      </div>
                    )}
                    {day.generating && (
                      <div className="summary-empty">
                        <div className="loading-dots" style={{ display: "block", marginBottom: 8 }}><span /><span /><span /></div>
                        Distilling your notes…
                      </div>
                    )}
                    {day.summary && !day.generating && (() => {
                      const sections = parseSummary(day.summary);
                      const triggerSection = sections.find((s) =>
                        s.title.toLowerCase().includes("therapist") || s.title.toLowerCase().includes("trigger"));
                      const mainSections = sections.filter((s) => s !== triggerSection);
                      return (
                        <>
                          {mainSections.map((sec, i) => (
                            <div key={i} className="summary-block">
                              <div className="summary-block-title">{sec.title}</div>
                              <div className="summary-block-content">{sec.body.trim()}</div>
                            </div>
                          ))}
                          {triggerSection && (
                            <div className="summary-trigger-block">
                              <div className="summary-trigger-label">🌿 For Your Therapist</div>
                              <div className="summary-trigger-text">{triggerSection.body.trim()}</div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            REQUIREMENTS & ADMIN PAGE
            ════════════════════════════════════════════════════════════════════ */}
        {activePage === "admin" && (
          <div className="admin-content">
            <div className="admin-grid">
              {/* ── Document Upload ── */}
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <span className="admin-panel-title">Admin Documents</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => adminFileRef.current?.click()}>+ Add</button>
                </div>
                <div className="admin-panel-body">
                  <input ref={adminFileRef} type="file" className="upload-input"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp" multiple
                    onChange={(e) => e.target.files && handleAdminFiles(e.target.files)} />

                  {adminDocs.length === 0 ? (
                    <div className={`admin-upload-zone${adminDragOver ? " drag-over" : ""}`}
                      onClick={() => adminFileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setAdminDragOver(true); }}
                      onDragLeave={() => setAdminDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setAdminDragOver(false); handleAdminFiles(e.dataTransfer.files); }}>
                      <div className="upload-icon">📄</div>
                      <div className="upload-text">
                        <strong>Upload admin documents</strong><br />
                        Emails, forms, agreements<br />
                        .pdf · .png · .jpg
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="doc-list">
                        {adminDocs.map((d) => (
                          <div key={d.id} className="doc-item">
                            <span className="doc-icon">📄</span>
                            <div className="doc-info">
                              <div className="doc-name">{d.name}</div>
                              <div className="doc-size">{fmtBytes(d.size)}</div>
                            </div>
                            <button className="doc-remove" onClick={() => removeDoc(d.id)}>×</button>
                          </div>
                        ))}
                      </div>
                      <div className="admin-upload-zone" style={{ marginTop: 10, padding: "12px 14px" }}
                        onClick={() => adminFileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setAdminDragOver(true); }}
                        onDragLeave={() => setAdminDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setAdminDragOver(false); handleAdminFiles(e.dataTransfer.files); }}>
                        <div className="upload-text" style={{ fontSize: 11 }}>+ Add another document</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Requirements Checklist ── */}
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <span className="admin-panel-title">Requirements Checklist</span>
                  <button className="btn btn-sage btn-sm" onClick={generateTaskList}
                    disabled={extracting || adminDocs.length === 0}>
                    {extracting ? <span className="loading-dots"><span /><span /><span /></span> : "✦ Generate Task List"}
                  </button>
                </div>
                <div className="admin-panel-body">
                  {/* Progress */}
                  {totalCount > 0 && (
                    <div className="checklist-progress">
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="progress-text">
                        {completedCount} of {totalCount} complete
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  {totalCount === 0 && !extracting && (
                    <div className="checklist-empty">
                      <div className="empty-icon">☐</div>
                      Add requirements manually below, or upload<br />
                      admin documents and tap <strong style={{ color: "var(--sage)" }}>Generate Task List</strong>
                    </div>
                  )}
                  {extracting && totalCount === 0 && (
                    <div className="checklist-empty">
                      <div className="loading-dots" style={{ display: "block", marginBottom: 8 }}>
                        <span /><span /><span />
                      </div>
                      Extracting requirements…
                    </div>
                  )}

                  {totalCount > 0 && (
                    <div className="checklist">
                      {sortedChecklist.map((item) => (
                        <div key={item.id} className={`checklist-item${item.done ? " done" : ""}`}>
                          <input type="checkbox" className="checklist-checkbox"
                            checked={item.done} onChange={() => toggleTask(item.id)} />
                          <span className="checklist-item-text">{item.text}</span>
                          <button className="checklist-item-remove" onClick={() => removeTask(item.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new */}
                  <div className="checklist-add">
                    <input className="checklist-input" type="text"
                      placeholder="Add a requirement…"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} />
                    <button className="btn btn-ink btn-sm" onClick={addTask} disabled={!newTask.trim()}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
