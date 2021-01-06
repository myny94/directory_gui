import produce from "immer"
import { Node } from './type'
// function to handle user input command

export function add_command(objectType: "directory" | "file", fullPath: String, treeData: Node): Node | undefined {
    const pathArray = fullPath.split("/");

    // add nodes according to the path
    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i];
            const lastOne = i === pathArray.length - 1;

            if (lastOne) {
                // exception: create duplicated file/ directory
                if (currentNode.children[id] !== undefined) {
                    alert(`${objectType} ${id} already exists`);
                    return undefined;
                }
                else {
                    currentNode.children[id] = { id: id, type: objectType, children: {} }
                }
            }

            else {
                if (currentNode.children[id] === undefined) {
                    currentNode.children[id] = { id: id, type: 'directory', children: {} }
                }
                else {
                    // exception: create file/ directory inside file
                    if (currentNode.children[id].type === 'file') {
                        alert(`Creating ${objectType} inside file is not possible`)
                        return undefined;
                    }
                }
                currentNode = currentNode.children[id];
            }
        }

    });

    return nextTreeData   
}

export function delete_command(objectType: "directory" | "file", fullPath: String, treeData: Node): Node | undefined {
    const pathArray = fullPath.split("/");
    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i];
            const lastOne = i === pathArray.length - 1;

            if (lastOne) {
                // exception: delete non-existent file
                if (currentNode.children[id] === undefined) {
                    alert(`Deleting non-existent ${objectType}: ${fullPath}`)
                }
                else {
                    // delete corresponding file or directory
                    delete currentNode.children[id];
                }
            }

            else {
                // exception: delete non-existent file
                if (currentNode.children[id] === undefined) {
                    alert(`Deleting non-existent ${objectType}: ${fullPath}`)
                }
                currentNode = currentNode.children[id];
            }
        }
    });

    return nextTreeData
}

export function move_command(searchTerm: String, treeData: Node): Node | undefined {
    const split_searchTerm = searchTerm.split(" ");
    const fromPath = split_searchTerm[1];
    const toPath = split_searchTerm[2];

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        // exception: "node to move" does not exist
        for (let i = 1; i < fromPath.split("/").length; i++) {
            const id = fromPath.split("/")[i];
            const lastOne = i === fromPath.split("/").length - 1;

            if (lastOne) {
                // exception: move non-existent file
                if (currentNode.children[id] === undefined) {
                    alert(`Moving non-existent file/directory in path : ${fromPath}`)
                    return (undefined);
                }
                else {
                    // move corresponding directory or file
                    const NodeToMove = currentNode.children[id];
                    console.log("node to move", NodeToMove.type)
                    console.log("to be added", `${toPath}${id}`)
                    console.log("to be deleted", fromPath)
                    // copy and add the data from path. This may raise error in case of adding inside file 
                    const addPath = toPath.slice(-1) === '/' ? `${toPath}${id}` : `${toPath}/${id}`;
                    const add_result = add_command(NodeToMove.type, addPath, treeData);
                    if ( add_result !== undefined) {
                       const move_result = delete_command(NodeToMove.type, `${fromPath}`, add_result);
                       return move_result
                    }
                }
            }

            else {
                // exception: "node to move" does not exist
                if (currentNode.children[id] === undefined) {
                    alert(`Moving non-existent file/directory in path : ${fromPath}`)
                }
                currentNode = currentNode.children[id];
                
            }
        }

    });

    return nextTreeData;
}

export function process_searchTerm(searchTerm: String, treeData: Node, setTreeData: (node: Node) => void) {
    const split_searchTerm = searchTerm.split(" ");
    const command = split_searchTerm[0].toLowerCase();

    if (command === 'add') {
        const objectType = split_searchTerm[1];
        const fullPath = split_searchTerm[2];
        if (objectType === 'file' || objectType === 'directory') {
            const add_result = add_command(objectType, fullPath, treeData);
            if (add_result !== undefined) {
                setTreeData(add_result)
            }
        } 
        else {
            alert(`${objectType}: wrong type data! Only directory/file can be created.`);
        }

    }

    else if (command === 'delete') {
        const objectType = split_searchTerm[1];
        const fullPath = split_searchTerm[2];
        if (objectType === 'file' || objectType === 'directory') {
            const delete_result = delete_command(objectType, fullPath, treeData);
            if (delete_result !== undefined) {
                setTreeData(delete_result)
            }
        } 
        else {
            alert(`${objectType}: wrong type data! Only directory/file can be deleted.`);
        }
    }

    else if (command === 'move') {
        const move_result = move_command(searchTerm, treeData);
        if (move_result !== undefined) {
            setTreeData(move_result)
        }
    }

    else if (command === 'change') {

    }
    else {
        alert('Unknown command!')
    }
}