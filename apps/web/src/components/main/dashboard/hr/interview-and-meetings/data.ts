import { MeetingItem, ScheduleDay } from "./types";

export const scheduleDaysData: ScheduleDay[] = [
  { key: "mon", date: 19 },
  { key: "tue", date: 20 },
  { key: "wed", date: 21, isActive: true },
  { key: "thu", date: 22 },
  { key: "fri", date: 23 },
  { key: "sat", date: 24 },
  { key: "sun", date: 25 },
];

export const meetingsData: MeetingItem[] = [
  {
    id: "meeting-1",
    key: "productSync",
    title: "Product Team Sync",
    time: "10:00 PM - 12:00 PM",
    participants: [
      { name: "Alex", avatar: "/images/user/user-01.jpg" },
      { name: "Sarah", avatar: "/images/user/user-02.jpg" },
      { name: "David", avatar: "/images/user/user-03.jpg" },
      { name: "Emily", avatar: "/images/user/user-04.jpg" },
      { name: "Michael", avatar: "/images/user/user-05.jpg" },
    ],
    extraParticipantsCount: 2,
    date: 21,
  },
  {
    id: "meeting-2",
    key: "frontendInterview",
    title: "Interview Candidates - Frontend Developer",
    time: "01:00 PM - 02:00 PM",
    participants: [
      { name: "John", avatar: "/images/user/user-06.jpg" },
      { name: "Lisa", avatar: "/images/user/user-07.jpg" },
      { name: "James", avatar: "/images/user/user-08.jpg" },
      { name: "Emma", avatar: "/images/user/user-09.jpg" },
      { name: "Daniel", avatar: "/images/user/user-10.jpg" },
    ],
    extraParticipantsCount: 1,
    date: 21,
  },
];
