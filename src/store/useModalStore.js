import { create } from 'zustand';

const initialAlert = {
  isOpen: false,
  title: '알림',
  message: '',
  confirmText: '확인',
  isDanger: false,
  onConfirm: null,
};

const initialConfirm = {
  isOpen: false,
  title: '확인',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  isDanger: false,
  onConfirm: null,
  onClose: null,
};

export const useModalStore = create((set) => ({
  alert: initialAlert,
  confirm: initialConfirm,

  openAlert: (params) =>
    set(() => ({
      alert: { ...initialAlert, isOpen: true, ...params },
    })),
  closeAlert: () =>
    set(() => ({
      alert: { ...initialAlert },
    })),

  openConfirm: (params) =>
    set(() => ({
      confirm: { ...initialConfirm, isOpen: true, ...params },
    })),
  closeConfirm: () =>
    set(() => ({
      confirm: { ...initialConfirm },
    })),
}));
