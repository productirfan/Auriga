import { useMemo, useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { WorkspaceHeader } from './components/workspace/WorkspaceHeader';
import { DocumentsToolbar } from './components/documents/DocumentsToolbar';
import { DocumentsTable, type SortKey, type SortState } from './components/documents/DocumentsTable';
import { documents } from './data/documents';

const sizeInBytes=(size:string)=>{
  const match=size.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
  const factors:Record<string,number>={B:1,KB:1024,MB:1024**2,GB:1024**3,TB:1024**4};
  return Number(match?.[1]??0)*factors[(match?.[2]??'MB').toUpperCase()];
};

export default function App() {
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState<SortState>(null);
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const [documentItems,setDocumentItems]=useState(documents);

  const shown=useMemo(()=>{
    const filtered=documentItems.filter(item=>item.name.toLowerCase().includes(query.toLowerCase()));
    if(!sort)return filtered;
    return [...filtered].sort((a,b)=>{
      let comparison=0;
      if(sort.key==='date')comparison=new Date(a.date).getTime()-new Date(b.date).getTime();
      else if(sort.key==='name')comparison=a.name.localeCompare(b.name);
      else if(sort.key==='size')comparison=sizeInBytes(a.size)-sizeInBytes(b.size);
      else if(sort.key==='uploader')comparison=a.uploader.localeCompare(b.uploader);
      else comparison=a.status.localeCompare(b.status);
      return sort.direction==='asc'?comparison:-comparison;
    });
  },[documentItems,query,sort]);

  const selectedItems=useMemo(()=>documentItems.filter(item=>selected.has(item.name)),[documentItems,selected]);
  const onSort=(key:SortKey)=>setSort(current=>current?.key===key?{key,direction:current.direction==='asc'?'desc':'asc'}:{key,direction:'asc'});
  const toggle=(name:string)=>{
    setSelected(current=>{const next=new Set(current);next.has(name)?next.delete(name):next.add(name);return next;});
  };
  const toggleAll=()=>{
    setSelected(current=>shown.length>0&&shown.every(item=>current.has(item.name))?new Set([...current].filter(name=>!shown.some(item=>item.name===name))):new Set([...current,...shown.map(item=>item.name)]));
  };
  const retryFailedDocuments=()=>{
    const failedNames=new Set(selectedItems.filter(item=>item.status==='Failed').map(item=>item.name));
    if(!failedNames.size)return;
    setDocumentItems(current=>current.map(item=>failedNames.has(item.name)?{...item,status:'In progress'}:item));
  };
  const deleteSelectedDocuments=()=>{
    const selectedNames=new Set(selectedItems.map(item=>item.name));
    setDocumentItems(current=>current.filter(item=>!selectedNames.has(item.name)));
    setSelected(current=>new Set([...current].filter(name=>!selectedNames.has(name))));
  };
  const clearSelection=()=>setSelected(new Set());

  return <div className="app-shell">
    <Sidebar/>
    <main className="workspace-card">
      <WorkspaceHeader/>
      <DocumentsToolbar query={query} onQueryChange={setQuery}/>
      <DocumentsTable items={shown} selected={selected} selectedItems={selectedItems} onToggle={toggle} onToggleAll={toggleAll} sort={sort} onSort={onSort} onRetryFailed={retryFailedDocuments} onDeleteSelected={deleteSelectedDocuments} onClearSelection={clearSelection}/>
    </main>
  </div>;
}
