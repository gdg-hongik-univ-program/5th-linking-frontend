import { createPortal } from 'react-dom';
import { useModalStore } from '../../store/useModalStore';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';

export default function GlobalModal() {
  const alert = useModalStore((s) => s.alert);
  const confirm = useModalStore((s) => s.confirm);
  const closeAlert = useModalStore((s) => s.closeAlert);
  const closeConfirm = useModalStore((s) => s.closeConfirm);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      <AlertModal
        {...alert}
        onConfirm={() => {
          try {
            alert.onConfirm?.();
          } finally {
            closeAlert();
          }
        }}
      />

      <ConfirmModal
        {...confirm}
        onConfirm={() => {
          try {
            confirm.onConfirm?.();
          } finally {
            closeConfirm();
          }
        }}
        onClose={() => {
          try {
            confirm.onClose?.();
          } finally {
            closeConfirm();
          }
        }}
      />
    </>,
    document.body,
  );
}
