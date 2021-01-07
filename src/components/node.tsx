import React, {useState} from 'react'
import styled from 'styled-components'
import closedFolder from '../images/closedFolder.svg'
import openFolder from '../images/openFolder.svg'
import file from '../images/file.svg'
import { Node } from '../type'
import './node.css'

type NodeProps = {
    collapsed?: boolean;
    depth: number;
    node: Node;
}

function NodeComponent(props: NodeProps) {

    return (
        <React.Fragment>
            <div className="item">
                <div style={{width: `${props.depth * 15}px`}}></div>
                <img className="itemIcon" 
                src={props.node.type === 'directory'? closedFolder: file} 
                alt="icon"/>
                <div className="itemText">{props.node.id}</div>
            </div>
            <React.Fragment>
                {Object.keys(props.node.children)
                .map((key, index) => 
                <NodeComponent key={`item-${index}`} node={props.node.children[key]} depth={props.depth + 1} />)}
            </React.Fragment>
        </React.Fragment>

    )
  }
  
  export default NodeComponent