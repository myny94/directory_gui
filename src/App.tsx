import React from 'react';
import { Node } from './type'
import NodeComponent from './components/node'
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

function App() {
    const [searchTerm, setSearchTerm] = React.useState<String>("");
    const [treeData, setTreeData] = React.useState<Node>({id: '/', type: "directory", children: {}});
    
    return (
        <div className="App">
            <header className="App-header">
                File system GUI
            </header>
            <div className="commandInput">
                <div> Input command here: </div>
                <input type='text'
                    onChange={event => setSearchTerm(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter" && searchTerm.split(" ").length === 3) {
                            process_searchTerm(searchTerm, treeData, setTreeData)
                            console.log(treeData)
                            setSearchTerm("")
                        }
                    }}>
                </input>
                <div className={'searchButton'}
                    onClick={() => {
                        if (searchTerm.split(" ").length === 3) {
                            process_searchTerm(searchTerm, treeData, setTreeData)
                            setSearchTerm("")
                        } else {
                            alert('Unknown command')
                        }
                }}>Execute
                </div>
                <div className={'searchButton'}
                    onClick={() => {
                        setTreeData({
                            id: "/",
                            type: 'directory',
                            children: {}})
                }}>Clear tree
                </div>    
            </div>
            
            <NodeComponent node={treeData} depth={1} />
        </div>
    );
}

export default App;
