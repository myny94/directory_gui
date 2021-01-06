import React from 'react'

type NodeProps = {
    collapsed?: boolean;
    nodeLabel?: string;
    children?: Node[];
    message: string;
}

function Node(props: NodeProps) {
    return (
        <div>{props.message}</div>
    )
  }
  
  export default Node