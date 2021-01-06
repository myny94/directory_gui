import React from 'react';
import { Node } from './type'
import { process_searchTerm } from './commands';
import './App.css';

/*
const n: Node2 = {
    id: "/",
    type: 'directory',
    children: {
        "c/": {
            id: "c/"
            type: "directory"
            children: {
                "d": {
                    id: "d",

                }
            }
        },
        "c": 
    }
}
*/

function NodePreview({ node, depth } : { node: Node, depth: number }) {
    return (<div style={{marginLeft: `${depth * 20}px` }}>
        {node.id}
        {Object.keys(node.children).map(key => <NodePreview node={node.children[key]} depth={depth + 1} />)}
    </div>)
}

function App() {
    const [searchTerm, setSearchTerm] = React.useState<String>("");
    const [treeData, setTreeData] = React.useState<Node>({id: '/', type: "directory", children: {}});

    console.log(treeData)
    return (
        <div className="App">
            <header className="App-header">
                File system GUI
            </header>
            <div> element </div>
            <input type='text'
                onChange={event => setSearchTerm(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter" && searchTerm.split(" ").length === 3) {
                        process_searchTerm(searchTerm, treeData, setTreeData)
                    }
                }}>
            </input>
            <div className={'searchButton'}
                onClick={() => {
                    if (searchTerm.split(" ").length === 3) {
                        process_searchTerm(searchTerm, treeData, setTreeData)
                    } else {
                        alert('Unknown command')
                    }
            }}>search
            </div>
            <NodePreview node={treeData} depth={0} />
        </div>
    );
}

export default App;
