import React, {useState} from 'react'
import styled from 'styled-components'
import closedFolder from '../images/closedFolder.svg'
import openFolder from '../images/openFolder.svg'
import file from '../images/file.svg'
import { Node } from '../type'
import './node.css'

type NodeProps = {
    depth: number;
    node: Node;
    link?: boolean
}

function NodeComponent(props: NodeProps) {

    return (
        <React.Fragment>
            <div className="item">
                <div style={{width: `${props.depth * 15}px`, backgroundColor: props.link ? 'gray':'white' }}></div>
                <img className="itemIcon" 
                src={props.node.type === 'directory'? closedFolder: file} 
                alt="icon"/>
                <div className="itemText">{props.node.id}</div>
            </div>
            <React.Fragment>
                {Object.keys(props.node.children)
                .map((key, index) => 
                <NodeComponent key={`item-${index}`} node={props.node.children[key]} depth={props.depth + 1} link={props.link}/>)}
            </React.Fragment>
        </React.Fragment>

    )
  }
  
  export default NodeComponent