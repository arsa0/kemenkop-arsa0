export interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

export interface CreatePost {
    title: string;
    body: string;
    userId: number;
}

export interface UpdatePost {
    id: number;
    title: string;
    body: string;
    userId: number;
}