export interface CalendarEvent {
  id: string;
  householdId: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}
