import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, EllipsisVertical, MessageCircle, Pin } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

const recent = ['Policy coverage for internal review', 'Insurance claim processing workflow', 'Vendor contract termination checklist', 'Access rights for external reviewers'];
const older = ['Transcription feedback UI redesign', 'Implementing flow in web application', 'Brutalist portfolio with locomotive scroll', 'ATS-optimized resume for product designer'];

function FlyoutChatEntry({chat,onOpen}: {chat:string;onOpen:(chat:string)=>void}) {
  return <Tooltip content={chat} placement="right" onlyWhenTruncated className="flyout-tooltip-anchor"><button type="button" role="menuitem" tabIndex={-1} className="chat-entry flyout-entry" aria-label={chat} onClick={()=>onOpen(chat)}>{chat}</button></Tooltip>;
}

function ChatList({items,onOpen,flyout=false}: {items:string[];onOpen:(chat:string)=>void;flyout?:boolean}) {
  return <div className={`chat-list${flyout?' chat-flyout-list':''}`}>
    {items.map(chat=>flyout
      ? <FlyoutChatEntry key={chat} chat={chat} onOpen={onOpen}/>
      : <div key={chat} className="chat-entry" title={chat}><button type="button" className="chat-open" onClick={()=>onOpen(chat)}>{chat}</button><button type="button" className="chat-menu" aria-label={`Options for ${chat}`}><EllipsisVertical/></button></div>
    )}
  </div>;
}

export function ChatsSection({collapsed}: {collapsed:boolean}) {
  const [chatsOpen,setChatsOpen]=useState(true);
  const [flyoutOpen,setFlyoutOpen]=useState(false);
  const [position,setPosition]=useState({left:0,top:12});
  const triggerRef=useRef<HTMLButtonElement>(null);
  const flyoutRef=useRef<HTMLDivElement>(null);
  const closeTimer=useRef<number|null>(null);
  const cancelClose=()=>{if(closeTimer.current!==null){window.clearTimeout(closeTimer.current);closeTimer.current=null;}};
  const scheduleClose=()=>{cancelClose();closeTimer.current=window.setTimeout(()=>setFlyoutOpen(false),180);};
  const openFlyout=()=>{cancelClose();setFlyoutOpen(true);};
  const openFirstChat=()=>{openFlyout();window.requestAnimationFrame(()=>flyoutRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());};

  useEffect(()=>{if(!collapsed){setFlyoutOpen(false);cancelClose();}},[collapsed]);
  useEffect(()=>()=>cancelClose(),[]);
  useLayoutEffect(()=>{
    if(!collapsed||!flyoutOpen||!triggerRef.current)return;
    const updatePosition=()=>{
      const rect=triggerRef.current?.getBoundingClientRect();
      if(!rect)return;
      const panelHeight=flyoutRef.current?.getBoundingClientRect().height??400;
      setPosition({left:rect.right+8,top:Math.max(12,Math.min(rect.top-6,window.innerHeight-panelHeight-12))});
    };
    updatePosition();
    window.addEventListener('resize',updatePosition);
    window.addEventListener('scroll',updatePosition,true);
    return()=>{window.removeEventListener('resize',updatePosition);window.removeEventListener('scroll',updatePosition,true);};
  },[collapsed,flyoutOpen]);
  useEffect(()=>{
    if(!flyoutOpen)return;
    const onPointerDown=(event:PointerEvent)=>{
      const target=event.target as Node;
      if(!triggerRef.current?.contains(target)&&!flyoutRef.current?.contains(target))setFlyoutOpen(false);
    };
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        setFlyoutOpen(false);
        triggerRef.current?.focus();
      } else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
        const items=Array.from(flyoutRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')??[]);
        if(!items.length)return;
        event.preventDefault();
        const index=items.indexOf(document.activeElement as HTMLElement);
        const next=event.key==='ArrowDown'?(index+1+items.length)%items.length:(index<=0?items.length-1:index-1);
        items[next].focus();
      } else if(event.key==='Home'||event.key==='End'){
        const items=flyoutRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
        if(!items?.length)return;
        event.preventDefault();
        items[event.key==='Home'?0:items.length-1].focus();
      }
    };
    document.addEventListener('pointerdown',onPointerDown);
    document.addEventListener('keydown',onKeyDown);
    return()=>{document.removeEventListener('pointerdown',onPointerDown);document.removeEventListener('keydown',onKeyDown);};
  },[flyoutOpen]);

  const openChat=()=>setFlyoutOpen(false);
  const handleTriggerKeyDown=(event:KeyboardEvent<HTMLButtonElement>)=>{
    if(collapsed&&(event.key==='ArrowDown'||event.key==='ArrowUp')){event.preventDefault();openFirstChat();}
  };
  return <div className="chats-section">
    <Tooltip content="Pinned" placement="right" disabled={!collapsed} className="pinned-tooltip-anchor"><button className="pinned-heading" aria-label="Pinned" aria-disabled="true" tabIndex={collapsed?0:-1}><Pin/><span>Pinned</span><ChevronRight/></button></Tooltip>
    <button ref={triggerRef} className="chats-heading" aria-expanded={collapsed?flyoutOpen:chatsOpen} aria-haspopup={collapsed?'menu':undefined} aria-controls={collapsed?'collapsed-chats-menu':undefined} onClick={()=>{if(collapsed)openFlyout();else setChatsOpen(value=>!value);}} onFocus={()=>collapsed&&openFlyout()} onPointerEnter={event=>{if(collapsed&&(event.pointerType==='mouse'||event.pointerType==='pen'))openFlyout();}} onPointerLeave={()=>collapsed&&scheduleClose()} onPointerDown={event=>{if(collapsed&&event.pointerType==='touch')openFlyout();}} onKeyDown={handleTriggerKeyDown} aria-label="Chats"><MessageCircle/><span>Chats</span><ChevronDown className={chatsOpen?'':'closed'}/></button>
    {chatsOpen&&!collapsed&&<><ChatList items={recent} onOpen={openChat}/><div className="older-label">OLDER</div><ChatList items={older} onOpen={openChat}/></>}
    {collapsed&&flyoutOpen&&createPortal(<div ref={flyoutRef} id="collapsed-chats-menu" className="chat-flyout" role="menu" aria-label="Chats" style={{left:position.left,top:position.top}} onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
      <div className="chat-flyout-content"><ChatList items={[...recent,...older]} onOpen={openChat} flyout/></div>
    </div>,document.body)}
  </div>;
}
