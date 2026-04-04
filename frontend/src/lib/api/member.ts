import { apiFetch } from '../api';

export interface SavingsData {
    net_savings: number;
    total_deposited: number;
    total_withdrawn: number;
    retention_rate: number;
    trend: { month: string; amount: number }[];
    history: {
        id: number;
        created_at: string;
        transaction_type: string;
        notes: string;
        amount: number;
        status: string;
    }[];
}

export interface SharesData {
    portfolio_value: number;
    units: number;
    share_price: number;
    gain_pct: number;
    projected_dividend: number;
    ownership_pct: number;
    history: {
        created_at: string;
        reference_no: string;
        units: number;
        unit_price: number;
        total_value: number;
        transaction_type: string;
    }[];
    chart_data: { label: string; value: number }[];
}

export interface LoanData {
    limit: number;
    active_loan: {
        loan_id: number;
        loan_type: string;
        amount: number;
        current_balance: number;
        status: string;
        progress_percent: number;
        total_payable: number;
        next_repayment_date: string;
    } | null;
    history: {
        created_at: string;
        loan_type: string;
        amount: number;
        status: string;
        current_balance: number;
    }[];
}

export const MemberApi = {
    getSavings: () => apiFetch<{status: string, data: SavingsData}>('/api/member/savings').then(res => res.data),
    getShares: () => apiFetch<{status: string, data: SharesData}>('/api/member/shares').then(res => res.data),
    getLoans: () => apiFetch<{status: string, data: LoanData}>('/api/member/loans').then(res => res.data),
};
