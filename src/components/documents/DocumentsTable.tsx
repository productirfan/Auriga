import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, RotateCcw, Trash2, X } from 'lucide-react';
import type { DocumentItem } from '../../data/documents';
import { DocumentRow } from './DocumentRow';

export type SortKey = 'name' | 'size' | 'date' | 'uploader' | 'status';
export type SortState = {key:SortKey;direction:'asc'|'desc'} | null;

function SortableHeading({label,column,sort,onSort}: {label:string;column:SortKey;sort:SortState;onSort:(key:SortKey)=>void}) {
  const active=sort?.key===column;
  return <button className={`table-heading${active?' is-sorted':''}`} onClick={()=>onSort(column)} aria-label={`Sort by ${label}${active?`, currently ${sort.direction === 'asc'?'ascending':'descending'}`:''}`} aria-sort={active?(sort.direction==='asc'?'ascending':'descending'):'none'}>
    <span>{label}</span><span className={`sort-indicator${active?` sort-${sort.direction}`:''}`} aria-hidden="true"/>
  </button>;
}

function BulkActions({selectedItems,onRetryFailed,onRequestDelete,onClearSelection,onBackToTop,showBackToTop}: {selectedItems:DocumentItem[];onRetryFailed:()=>void;onRequestDelete:()=>void;onClearSelection:()=>void;onBackToTop:()=>void;showBackToTop:boolean}) {
  const failedCount=selectedItems.filter(item=>item.status==='Failed').length;
  return <div className="bulk-actions-bar" aria-label="Bulk actions for selected documents">
    <div className="bulk-action-copy"><div className="bulk-selection-heading"><button type="button" className="bulk-clear-button" onClick={onClearSelection} aria-label="Clear selection" title="Clear selection"><X/></button><strong>{selectedItems.length} selected</strong></div></div>
    <span className="bulk-action-divider" aria-hidden="true"/>
    <div className="bulk-action-buttons">
      <button type="button" className="bulk-action-button retry" onClick={onRetryFailed} disabled={!failedCount} title={failedCount?'Retry selected failed files.':'Retry is available for failed files only.'}><RotateCcw/><span>Retry{failedCount?` (${failedCount})`:''}</span></button>
      <button type="button" className="bulk-action-button delete" onClick={onRequestDelete}><Trash2/><span>Delete ({selectedItems.length})</span></button>
      {showBackToTop&&<button type="button" className="bulk-action-button bulk-back-to-top" onClick={onBackToTop} aria-label="Back to top" title="Back to top"><ArrowUp aria-hidden="true"/></button>}
    </div>
  </div>;
}

function DeleteConfirmation({count,onCancel,onConfirm}: {count:number;onCancel:()=>void;onConfirm:()=>void}) {
  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')onCancel();};
    document.addEventListener('keydown',onKeyDown);
    return()=>document.removeEventListener('keydown',onKeyDown);
  },[onCancel]);

  return createPortal(<div className="bulk-delete-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel();}}>
    <section className="bulk-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="bulk-delete-title" aria-describedby="bulk-delete-description">
      <span className="bulk-delete-icon"><Trash2 aria-hidden="true"/></span>
      <h2 id="bulk-delete-title">Delete {count} {count===1?'document':'documents'}?</h2>
      <p id="bulk-delete-description">The selected files will be removed from this knowledge base.</p>
      <div className="bulk-delete-actions"><button type="button" className="bulk-delete-cancel" onClick={onCancel} autoFocus>Cancel</button><button type="button" className="bulk-delete-confirm" onClick={onConfirm}>Delete files</button></div>
    </section>
  </div>,document.body);
}

export function DocumentsTable({items,selected,selectedItems,onToggle,onToggleAll,sort,onSort,onRetryFailed,onDeleteSelected,onClearSelection}: {items:DocumentItem[];selected:Set<string>;selectedItems:DocumentItem[];onToggle:(name:string)=>void;onToggleAll:()=>void;sort:SortState;onSort:(key:SortKey)=>void;onRetryFailed:()=>void;onDeleteSelected:()=>void;onClearSelection:()=>void}) {
  const allSelected=items.length>0&&items.every(item=>selected.has(item.name));
  const tableRef=useRef<HTMLDivElement>(null);
  const [showBackToTop,setShowBackToTop]=useState(false);
  const [showDeleteConfirmation,setShowDeleteConfirmation]=useState(false);

  useEffect(()=>{
    const table=tableRef.current;
    if(!table)return;
    const updateVisibility=()=>setShowBackToTop(table.scrollTop>160);
    table.addEventListener('scroll',updateVisibility,{passive:true});
    return()=>table.removeEventListener('scroll',updateVisibility);
  },[]);

  const backToTop=()=>tableRef.current?.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  const confirmDelete=()=>{onDeleteSelected();setShowDeleteConfirmation(false);};

  return <div className="table-region">
    <div ref={tableRef} className={`table-wrap${selectedItems.length?' has-selection':''}`}>
      <div className="table-header"><div className="check-cell"><button className={`checkbox ${allSelected?'checked':''}`} onClick={onToggleAll} aria-label="Select all">{allSelected&&<svg viewBox="0 0 16 16"><path d="m3 8 3.2 3.2L13 4.5"/></svg>}</button></div><div><SortableHeading label="File Name" column="name" sort={sort} onSort={onSort}/></div><div><SortableHeading label="File Size" column="size" sort={sort} onSort={onSort}/></div><div><SortableHeading label="Date Uploaded" column="date" sort={sort} onSort={onSort}/></div><div><SortableHeading label="Uploaded by" column="uploader" sort={sort} onSort={onSort}/></div><div><SortableHeading label="Status" column="status" sort={sort} onSort={onSort}/></div><div/></div>
      <div className="table-body">{items.map(item=><DocumentRow key={item.name} item={item} selected={selected.has(item.name)} onSelect={()=>onToggle(item.name)}/>)}</div>
    </div>
    {selectedItems.length>0&&<div className="bulk-actions-dock"><BulkActions selectedItems={selectedItems} onRetryFailed={onRetryFailed} onRequestDelete={()=>setShowDeleteConfirmation(true)} onClearSelection={onClearSelection} onBackToTop={backToTop} showBackToTop={showBackToTop}/></div>}
    {showBackToTop&&selectedItems.length===0&&<button type="button" className="back-to-top" onClick={backToTop}><ArrowUp aria-hidden="true"/><span>Back to top</span></button>}
    {showDeleteConfirmation&&<DeleteConfirmation count={selectedItems.length} onCancel={()=>setShowDeleteConfirmation(false)} onConfirm={confirmDelete}/>}
  </div>;
}
