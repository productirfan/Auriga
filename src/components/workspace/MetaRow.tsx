import { CalendarDays, Clock3, Hash, UserRound } from 'lucide-react';
const items = [{Icon:UserRound,text:'Irfan Khan (You)'},{Icon:Clock3,text:'Last active Aug 28, 2026'},{Icon:CalendarDays,text:'Created on Sep 10, 2025'},{Icon:Hash,text:'VOIP +1 (415) 571-2153'}];
export function MetaRow() { return <div className="meta-row">{items.map(({Icon,text},i)=><div className="meta-item" key={text}>{i>0&&<i className="meta-dot"/>}<Icon/><span>{text}</span></div>)}</div>; }
