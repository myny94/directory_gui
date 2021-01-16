import React from 'react';
import { Node } from './type'
import NodeComponent from './components/node'
import { process_searchTerm } from './commands';
import './App.css';
import manual from './images/instructions.svg'
import alertImage from './images/alert.svg'

function App() {
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [treeData, setTreeData] = React.useState<Node>({id: '/', type: "directory", children: {}});
    
    return (
        <div className="App">
            <header className="App-header">
                File system GUI
            </header>
            <div className="commandInput">
                <div> Input command here: </div>
                <input type='text'
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter" && searchTerm.split(" ").length === 3) {
                            process_searchTerm(searchTerm, treeData, setTreeData)
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
            <div className="userManual">
                <div className="manualHeader"><img src={manual} className="manualPhoto"/> User manual</div>
                <li>Adding directory/file: "Add directory/file path"</li>
                <li>Deleting directory/file: "Delete directory/file path"</li>
                <li>Moving directory/file: "Move (path to move from) (path to move to)"</li>
                <div className="manualHeader"><img src={alertImage} className="manualPhoto"/> Exceptions </div>
                <li>Creating or moving a file/directory inside non-existing directory will create directories recursively </li>
                <li>Creating file or directory with a duplicated name(path) is not possible.</li>
                <li>Deleting wrong type of data or non-existing data is not possible</li> 
            </div>
            
            <NodeComponent node={treeData} depth={1} />
        </div>
    );
}

export default App;
