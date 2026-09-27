import { Cloud, CloudOff, HardDrive, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '../lib/courseProgress';

/** Tells the student their work is saved, and where. */
export default function SaveStatus() {
  const status = useSyncStatus();
  const { icon: Icon, text, title } = {
    synced: { icon: Cloud, text: 'Guardado', title: 'Tu progreso está guardado en la nube' },
    syncing: { icon: RefreshCw, text: 'Guardando…', title: 'Guardando tu progreso' },
    local: { icon: HardDrive, text: 'Guardado en este navegador', title: 'Sin conexión con el servidor: se guarda en este navegador' },
    error: { icon: CloudOff, text: 'Guardado local, reintentando', title: 'No se pudo subir a la nube; está guardado en este navegador y se reintenta solo' },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={title} role="status">
      <Icon className={`size-3.5 ${status === 'syncing' ? 'animate-spin' : ''} ${status === 'synced' ? 'text-success' : ''}`} aria-hidden />
      {text}
    </span>
  );
}
