export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type PostsState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
};
