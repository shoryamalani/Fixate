
import React from 'react';
import {useDraggable} from '@dnd-kit/core';
function Draggable(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0`,
    

  } : undefined;

  
  return ( 
    props.visible ?
    <button   ref={setNodeRef} style={{...style,backgroundColor:'transparent',border:'none',zIndex:10}} {...listeners} {...attributes}>
      {props.children}
    </button>: null
    )
}
export default Draggable;