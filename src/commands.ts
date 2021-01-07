import produce from "immer"
import { Node } from './type'
// function to handle user input command

export function add_command(objectType: "directory" | "file", fullPath: String, treeData: Node): Node {
    // if the path ends with slash, prevent making file/directory with empty name
    const pathArray = fullPath.slice(-1) === "/" ? fullPath.slice(0, -1).split("/") : fullPath.split("/");
    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i];
            const lastOne = i === pathArray.length - 1;
            if (lastOne) {
                // exception: create duplicated file/ directory
                if (currentNode.children[id] !== undefined) throw `${objectType} ${id} already exists`
                else {
                    currentNode.children[id] = { id: id, type: objectType, children: {} }
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
                }
                currentNode = currentNode.children[id];
            }
        }

    });

    return nextTreeData
}

export function delete_command(objectType: "directory" | "file", fullPath: String, treeData: Node): Node {
    // if the path ends with slash, prevent deleting file/directory with empty name
    const pathArray = fullPath.slice(-1) === "/" ? fullPath.slice(0, -1) : fullPath;

    const nextTreeData = produce(treeData, draftData => {
        let currentNode = draftData;
        for (let i = 1; i < pathArray.length; i++) {
            const id = pathArray[i];
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
    const fromPath = split_searchTerm[1];
    const toPath = split_searchTerm[2];

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
                    console.log("node to move", NodeToMove.type)
                    console.log("to be added", `${toPath}${id}`)
                    console.log("to be deleted", fromPath)
                    // copy and add the data from path. This may raise error in case of adding inside file 
                    const addPath = toPath.slice(-1) === '/' ? `${toPath}${id}` : `${toPath}/${id}`;
                    console.log("add path", addPath)
                    const add_result = add_command(NodeToMove.type, addPath, treeData);
                    const move_result = delete_command(NodeToMove.type, `${fromPath}`, add_result);
                    return move_result;
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
/*
export function link_command(searchTerm: String, treeData: Node): Node | undefined {
    const split_searchTerm = searchTerm.split(" ");
    const fromPath = split_searchTerm[1];
    const toPath = split_searchTerm[2];
}
*/
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
        //  const link_result = link_command(searchTerm, treeData);
        //if (link_result !== undefined) {
        //    setTreeData(link_result)
        //}

    }

    else if (command === 'change') {

    }
    else {
        alert('Unknown command!')
    }
}