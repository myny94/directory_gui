import { link } from "fs";
import produce from "immer"
import { Children } from "react";
import { Node } from './type'
// function to handle user input command

// help function: check if array contains empty string
function checkArray(array: String[]){
    let empty_occurence = 0;
    for(let i=0; i< array.length; i++){
        if(array[i] === "")   
           empty_occurence ++;
    }
    return empty_occurence === 1;
 }

export function add_command(objectType: "directory" | "file", fullPath: String, treeData: Node, children?: {[key: string]: Node }): Node {
    // if the path ends with slash, prevent making file/directory with empty name
    const pathArray = fullPath.slice(-1) === "/" ? fullPath.slice(0, -1).split("/") : fullPath.split("/");

    // exception: check if the path contains empty file or directory
    console.log(pathArray);
    if ( !checkArray(pathArray)) throw 'File or directory name cannot be empty'

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i].toLowerCase();
            const lastOne = i === pathArray.length - 1;
            if (lastOne) {
                // exception: create duplicated file/ directory
                if (currentNode.children[id] !== undefined) throw `${objectType} ${id} already exists`
                else {
                    if (children !== undefined) {
                        currentNode.children[id] = { id: id, type: objectType, children: children }
                    }
                    else {
                        currentNode.children[id] = { id: id, type: objectType, children: { } }
                    }
                }
            }
            else {
                // create the directories recursively if not exists
                if (currentNode.children[id] === undefined) {
                    currentNode.children[id] = { id: id, type: 'directory', children: {} }
                }
                else {
                    // exception: create file/ directory inside file
                    if (currentNode.children[id] !== undefined && currentNode.children[id].type === "file")
                        throw `Creating ${objectType} inside file is not possible`

                    // exception: try creating in link
                    else if (currentNode.children[id].link ) {
                        throw `Creating ${objectType} to symbolic link is not possible`
                    }
                }
                currentNode = currentNode.children[id];
            }
        }

    });

    return nextTreeData
}

export function delete_command(objectType: "directory" | "file", fullPath: String, treeData: Node): Node {
    // if the path ends with slash, prevent deleting file/directory with empty name
    const pathArray = fullPath.slice(-1) === "/" ? fullPath.slice(0, -1).split("/") : fullPath.split("/");
    console.log("path array", pathArray)

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i].toLowerCase();
            console.log("id", id)
            const lastOne = i === pathArray.length - 1;

            if (lastOne) {
                // exception: delete non-existent file
                if (currentNode.children[id] === undefined) {
                    throw `Deleting non-existent ${objectType}: ${fullPath}`
                }
                else {
                    // exception: try deleting wrong type of object
                    if (currentNode.children[id].type !== objectType) {
                        throw `Deleting wrong type of data: check if the type of data you try to delete is ${objectType}`
                    }
                    else {
                        delete currentNode.children[id];
                    }
                }
            }

            else {
                // exception: delete non-existent file
                if (currentNode.children[id] === undefined) {
                    throw `Deleting non-existent ${objectType}: ${fullPath}`
                }
                currentNode = currentNode.children[id];
            }
        }
    });

    return nextTreeData
}

export function move_command(searchTerm: String, treeData: Node): Node {
    const split_searchTerm = searchTerm.split(" ");
    const fromPath = split_searchTerm[1].slice(-1) === "/" ? split_searchTerm[1].slice(0, -1) : split_searchTerm[1];
    const toPath = split_searchTerm[2].slice(-1) === "/" ? split_searchTerm[2].slice(0, -1) : split_searchTerm[2];

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < fromPath.split("/").length; i++) {
            const id = fromPath.split("/")[i];
            const lastOne = i === fromPath.split("/").length - 1;

            if (lastOne) {
                // exception: move non-existent file
                if (currentNode.children[id] === undefined) {
                    throw `Moving non-existent file/directory in path : ${fromPath}`
                }
                else {
                    // move corresponding directory or file
                    const NodeToMove = currentNode.children[id];
                    console.log("node to move", NodeToMove.id);
                    // copy and add the data from path. This may raise error in case of adding inside file 
                    //const addPath = toPath.slice(-1) === '/' ? `${toPath}${id}` : `${toPath}/${id}`;
                    const addPath = `${toPath}/${id}`;
                    console.log("add path", addPath)
                    console.log("node to move's children", NodeToMove.children.length)

                    if ( NodeToMove.children === undefined ) {
                        const add_result = add_command(NodeToMove.type, addPath, treeData);
                        const move_result = delete_command(NodeToMove.type, `${fromPath}`, add_result);
                        return move_result;
                    }
                    // if the node to move has children, children should be manually added
                    else {
                        const add_result = add_command(NodeToMove.type, addPath, treeData, NodeToMove.children);
                        const move_result = delete_command(NodeToMove.type, `${fromPath}`, add_result);
                        return move_result;
                    }
                }
            }

            else {
                // exception: "node to move" does not exist
                if (currentNode.children[id] === undefined) {
                    throw `Moving non-existent file/directory in path : ${fromPath}`
                }
                currentNode = currentNode.children[id];
            }
        }
    });

    return nextTreeData;
}

export function link_command(searchTerm: String, treeData: Node): Node {
    const split_searchTerm = searchTerm.split(" ");
    const fromPath = split_searchTerm[1].slice(-1) === "/" ? split_searchTerm[1].slice(0, -1) : split_searchTerm[1];
    const toPath = split_searchTerm[2].slice(-1) === "/" ? split_searchTerm[2].slice(0, -1) : split_searchTerm[2];
    // to path: imaginary path

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        let currentNode2 = draftData;
        for (let i = 1; i < fromPath.split("/").length; i++) {
            const id = fromPath.split("/")[i];
            console.log("id", id)
            const lastOne = i === fromPath.split("/").length - 1;

            if (lastOne) {
                // exception: if the path to link from does not exist
                if (currentNode.children[id] === undefined) {
                    throw `Linking non-existent file/directory in path : ${fromPath}`
                }
                else {
                    const NodeToLink = currentNode.children[id];
                    for (let j = 1; j < toPath.split("/").length; j++) {

                        const linkId = toPath.split("/")[j];
                        const lastId = j === toPath.split("/").length - 1;

                        if ( lastId ) {
                            // exception: path to link to should not exist
                            if ( currentNode2.children[linkId] !== undefined) {
                                throw `The path to link to already exists: ${toPath}`
                            }
                            else {
                                currentNode2.children[linkId] = { id: linkId, type: NodeToLink.type, children: {} }
                                currentNode2.children[linkId].children = NodeToLink.children;
                                currentNode2.children[linkId].link = true;
                                currentNode.children[id].redirect = toPath;
                            }
                        }
                        else {
                            // exception: try linking to the path that does not exist
                            if ( currentNode2.children[linkId] === undefined) {
                                throw `Try linking to the path that does not exist: ${toPath}`
                            }
                            else {
                                currentNode2 = currentNode2.children[linkId];
                            }
                        }
                    }
                }
            }

            else {
                // exception: if the path to link does not exist 
                if (currentNode.children[id] === undefined) {
                    throw `Linking non-existent file/directory in path : ${fromPath}`
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
            try {
                const add_result = add_command(objectType, fullPath, treeData);
                if (add_result !== undefined) {
                    setTreeData(add_result)
                }
            } catch (err) {
                alert(err);
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
            try {
                const delete_result = delete_command(objectType, fullPath, treeData);
                if (delete_result !== undefined) {
                    setTreeData(delete_result)
                }
            } catch (err) {
                alert(err);
            }
        }
        else {
            alert(`${objectType}: wrong type data! Only directory/file can be deleted.`);
        }
    }

    else if (command === 'move') {
        try {
            const move_result = move_command(searchTerm, treeData);
            if (move_result !== undefined) {
                setTreeData(move_result)
            }
        } catch (err) {
            alert(err);
        }
    }

    else if (command === 'link') {
        try {
            const link_result = link_command(searchTerm, treeData);
            if (link_result !== undefined) {
                setTreeData(link_result)
            }
        } catch (err) {
            alert(err);
        }
    }

    else if (command === 'change') {

    }
    else {
        alert('Unknown command!')
    }
}