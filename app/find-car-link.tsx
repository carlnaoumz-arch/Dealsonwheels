'use client';
import type {ReactNode} from 'react';
export default function FindCarLink({children,className}:{children:ReactNode;className?:string}){
 return <a href="/?find-car=1#collection" data-find-car="true" className={className} aria-haspopup="dialog" onClick={event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||location.pathname!=='/')return;
  const request=new CustomEvent('open-find-my-car',{detail:event.currentTarget,cancelable:true});
  if(!document.dispatchEvent(request))event.preventDefault();
 }}>{children}</a>;
}
