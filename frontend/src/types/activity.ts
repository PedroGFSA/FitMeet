export interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  address: { latitude: number; longitude: number };
  scheduledDate: string;
  createdAt: string;
  completedAt: string;
  private: boolean;
  participantCount: number;
  creator: { id: string; name: string; avatar: string };
}

export interface PaginatedActivities {
  page: number;
  pageSize: number;
  totalActivities: number;
  totalPages: number;
  previous: number;
  next: number;
  activities: Activity[];
}
