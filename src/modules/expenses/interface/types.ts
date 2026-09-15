export interface Expense {
  id: string;
  createdAt: string;
}
export interface FetchExpenseResponse {
  data: Expense;
}
