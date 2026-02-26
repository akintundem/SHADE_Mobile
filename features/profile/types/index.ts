export type ProfileSection = 'events' | 'invited' | 'posts';

export type ProfileView = 'profile' | 'settings' | 'edit';

export type ProfileUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  profilePictureUrl?: string | null;
};

export type ProfileStats = {
  followers: number;
  following: number;
  events: number;
  posts: number;
};
