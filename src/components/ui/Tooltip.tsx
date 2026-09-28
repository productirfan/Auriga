import { cloneElement, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  children: ReactElement;
  content: string;
  placement?: TooltipPlacement;
  disabled?: boolean;
  onlyWhenTruncated?: boolean;
  className?: string;
};

const placements: TooltipPlacement[] = ['top', 'bottom', 'right', 'left'];
const gap = 8;
const edge = 8;

export function Tooltip({children,content,placement='top',disabled=false,onlyWhenTruncated=false,className=''}: TooltipProps) {
  const id=useId();
  const anchorRef=useRef<HTMLSpanElement>(null);
  const tooltipRef=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
  const [truncated,setTruncated]=useState(!onlyWhenTruncated);
  const [position,setPosition]=useState({left:-10000,top:-10000,side:placement,arrowOffset:0,ready:false});

  useLayoutEffect(()=>{
    if(!onlyWhenTruncated)return;
    const anchor=anchorRef.current;
    const target=anchor?.firstElementChild as HTMLElement|null;
    if(!anchor||!target)return;
    const measure=()=>setTruncated(target.scrollWidth>target.clientWidth+1);
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(anchor);
    observer.observe(target);
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[onlyWhenTruncated,content]);

  useLayoutEffect(()=>{
    if(!open||disabled||!truncated)return;
    const anchor=anchorRef.current;
    const tooltip=tooltipRef.current;
    if(!anchor||!tooltip)return;
    const trigger=anchor.firstElementChild as HTMLElement|null;
    if(!trigger)return;
    const updatePosition=()=>{
      const target=trigger.getBoundingClientRect();
      const tip=tooltip.getBoundingClientRect();
      const spaces:Record<TooltipPlacement,number>={top:target.top,bottom:window.innerHeight-target.bottom,left:target.left,right:window.innerWidth-target.right};
      const order=[placement,...placements.filter(side=>side!==placement)];
      const fits=(side:TooltipPlacement)=>spaces[side]>=(side==='left'||side==='right'?tip.width:tip.height)+gap+edge;
      const side=order.find(fits)??order.reduce((best,candidate)=>spaces[candidate]>spaces[best]?candidate:best,order[0]);
      let left=0,top=0,arrowOffset=0;
      if(side==='top'||side==='bottom'){
        left=Math.max(edge,Math.min(target.left+target.width/2-tip.width/2,window.innerWidth-tip.width-edge));
        top=side==='top'?target.top-tip.height-gap:target.bottom+gap;
        arrowOffset=Math.max(6,Math.min(target.left+target.width/2-left,tip.width-6));
      }else{
        left=side==='left'?target.left-tip.width-gap:target.right+gap;
        top=Math.max(edge,Math.min(target.top+target.height/2-tip.height/2,window.innerHeight-tip.height-edge));
        arrowOffset=Math.max(6,Math.min(target.top+target.height/2-top,tip.height-6));
      }
      setPosition({left,top,side,arrowOffset,ready:true});
    };
    updatePosition();
    window.addEventListener('resize',updatePosition);
    window.addEventListener('scroll',updatePosition,true);
    const observer=new ResizeObserver(updatePosition);
    observer.observe(trigger);
    observer.observe(tooltip);
    return()=>{window.removeEventListener('resize',updatePosition);window.removeEventListener('scroll',updatePosition,true);observer.disconnect();};
  },[open,disabled,truncated,placement,content]);

  const isClipped=()=>{
    if(!onlyWhenTruncated)return true;
    const target=anchorRef.current?.firstElementChild as HTMLElement|null;
    const clipped=!!target&&target.scrollWidth>target.clientWidth+1;
    setTruncated(clipped);
    return clipped;
  };
  const openTooltip=()=>{if(!disabled&&isClipped())setOpen(true);};
  const describedBy=children.props['aria-describedby'];
  const describedByValue=open&&!disabled&&truncated?[describedBy,id].filter(Boolean).join(' '):describedBy;
  const trigger=cloneElement(children,{'aria-describedby':describedByValue});
  const tooltipStyle={left:position.left,top:position.top,visibility:position.ready?'visible':'hidden','--tooltip-arrow-offset':`${position.arrowOffset}px`} as CSSProperties;

  return <span ref={anchorRef} role="none" className={`tooltip-anchor ${className}`.trim()} onPointerEnter={event=>{if(event.pointerType==='mouse'||event.pointerType==='pen')openTooltip();}} onPointerLeave={()=>setOpen(false)} onFocusCapture={openTooltip} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}} onKeyDownCapture={event=>{if(event.key==='Escape')setOpen(false);}}>
    {trigger}
    {open&&!disabled&&truncated&&createPortal(<div ref={tooltipRef} id={id} role="tooltip" className="app-tooltip" data-placement={position.side} style={tooltipStyle}>{content}</div>,document.body)}
  </span>;
}
