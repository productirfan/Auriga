import { EllipsisVertical } from 'lucide-react';
import type { DocumentItem } from '../../data/documents';
import { Tooltip } from '../ui/Tooltip';
import { FileTypeIcon, type FileType } from './FileTypeIcon';
import { StatusPill } from './StatusPill';

export function DocumentRow({item,selected,onSelect}: {item:DocumentItem;selected:boolean;onSelect:()=>void}) {
  const type=(item.name.endsWith('.pdf')?'pdf':item.name.endsWith('.xlsx')?'xlsx':'doc') as FileType;
  return <div className="document-row">
    <div className="check-cell"><button className={`checkbox ${selected?'checked':''}`} onClick={onSelect} aria-label={`Select ${item.name}`}>{selected&&<svg viewBox="0 0 16 16"><path d="m3 8 3.2 3.2L13 4.5"/></svg>}</button></div>
    <div className="file-cell"><FileTypeIcon type={type}/><Tooltip content={item.name} placement="top" onlyWhenTruncated className="file-name-tooltip-anchor"><div className="file-name">{item.name}</div></Tooltip></div>
    <div className="file-size-cell">{item.size}</div>
    <div className="date-cell">{item.date}</div>
    <div className="uploader-cell">{item.uploader}</div>
    <div className="status-cell"><StatusPill status={item.status}/></div>
    <div className="row-menu"><button className="icon-ghost" aria-label="Document options"><EllipsisVertical/></button></div>
  </div>;
}
