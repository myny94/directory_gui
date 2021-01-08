export type Node = {
    id: string
    type: 'directory' | 'file'
    children: { [key: string]: Node }
    property?: string
    redirect?: string
    link?: boolean
}