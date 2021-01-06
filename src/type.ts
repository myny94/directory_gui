export type Node = {
    id: string
    type: 'directory' | 'file'
    children: { [key: string]: Node }
}