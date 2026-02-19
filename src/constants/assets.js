export const PROFILE_ASSETS = [
  { id: 'GDG_LOGO', path: '/src/assets/gdg_logo.svg' },
  { id: 'HOME', path: '/src/assets/home.svg' },
  { id: 'SCHEDULE', path: '/src/assets/schedule.svg' },
  { id: 'STORAGE', path: '/src/assets/storage.svg' },
  { id: 'MIFFY', path: '/src/assets/miffyprofile.jpeg' },
  { id: 'GDG_FE', path: '/src/assets/gdgFe.png' },
  { id: 'GDG_MEM', path: '/src/assets/gdgMem.png' },
];

export const getProfilePath = (id) =>
  PROFILE_ASSETS.find((a) => a.id === id)?.path || PROFILE_ASSETS[0].path;
