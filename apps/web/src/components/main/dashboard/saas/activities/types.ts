export interface ActivityUser {
  name: string;
  avatar: string;
}

export interface ActivityBadgeData {
  textKey: string;
}

export interface ActivityItem {
  id: string;
  user: ActivityUser;
  badge?: ActivityBadgeData;
  actionKey: string;
  target: string;
  timestamp: string;
}
