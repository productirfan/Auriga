import type { DocumentStatus } from '../../data/documents';
export function StatusPill({status}: {status: DocumentStatus}) { return <span className={`status-pill ${status==='In progress'?'progress':status==='Digitised'?'digitised':'ready'}`}>{status}</span>; }
