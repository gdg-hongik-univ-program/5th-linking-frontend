import gdgMem from '../assets/gdgMem.png';
import hongikEmblemWhite from '../assets/hongik_emblem_white.png';
import hongikEmblemBlack from '../assets/hongik_emblem_black.png';
import imgMascot from '../assets/img-mascot.png';
import gdgLogo from '../assets/gdg_logo.png';
import gdgWorld from '../assets/gdgW.png';

// SVG data URI 헬퍼 함수 (Lucide UserRound 스타일)
const createLucideUserSvgObj = (bgColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23${bgColor.replace('#', '')}"/><svg x="25" y="25" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

// SVG data URI 헬퍼 함수 (플랫 스타일)
const createEmojiSvgObj = (emoji, bgColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23${bgColor.replace('#', '')}"/><text fill="%23ffffff" y="50%" x="50%" dominant-baseline="central" text-anchor="middle" font-size="75" dy="3%">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

export const PROFILE_ASSETS = [
  { id: 'GDG_LOGO', path: gdgLogo, bg: '#ffffffff', scale: 0.9, padding: '4px' },
  { id: 'GDG_MEM', path: gdgMem, scale: 1.3, padding: '4px' },
  { id: 'GDG_WORLD', path: gdgWorld, scale: 1.3, padding: '4px' },
  { id: 'HONGIK_EMBLEM_BLACK', path: hongikEmblemBlack, bg: '#ffffff', scale: 1, padding: '4px' },
  { id: 'HONGIK_EMBLEM_WHITE', path: hongikEmblemWhite, bg: '#171717', scale: 1, padding: '4px' },
  { id: 'MASCOT', path: imgMascot, bg: '#ffffff', scale: 1.2, padding: '0px' },

  { id: 'DEFAULT', path: createLucideUserSvgObj('3f3f46'), scale: 1, padding: '0px' },

  
  // Concept A: Dark Monochrome
  { id: 'PAWN', path: createEmojiSvgObj('♟', '3f3f46') },
  { id: 'KNIGHT', path: createEmojiSvgObj('♞', '3f3f46') },
  { id: 'BISHOP', path: createEmojiSvgObj('♝', '3f3f46') },
  { id: 'ROOK', path: createEmojiSvgObj('♜', '3f3f46') },
  { id: 'QUEEN', path: createEmojiSvgObj('♛', '3f3f46') },
  { id: 'KING', path: createEmojiSvgObj('♚', '3f3f46') },

  // Concept B: Dark Jewel Tones
  { id: 'PAWN_COLOR', path: createEmojiSvgObj('♟', '14532d') }, 
  { id: 'KNIGHT_COLOR', path: createEmojiSvgObj('♞', '164e63') }, 
  { id: 'BISHOP_COLOR', path: createEmojiSvgObj('♝', '1e3a8a') }, 
  { id: 'ROOK_COLOR', path: createEmojiSvgObj('♜', '581c87') }, 
  { id: 'QUEEN_COLOR', path: createEmojiSvgObj('♛', '854d0e') }, 
  { id: 'KING_COLOR', path: createEmojiSvgObj('♚', '9f1239') }, 

]

export const getProfilePath = (id) =>
  PROFILE_ASSETS.find((a) => a.id === id)?.path || PROFILE_ASSETS[0].path;

export const getProfileAsset = (id) =>
  PROFILE_ASSETS.find((a) => a.id === id) || PROFILE_ASSETS[0];
