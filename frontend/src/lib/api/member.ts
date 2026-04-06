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
    wallet_balance: number;
    total_savings: number;
    active_loan: {
        loan_id: number;
        loan_type: string;
        amount: number;
        current_balance: number;
        status: string;
        progress_percent: number;
        total_payable: number;
        interest_rate: number;
        next_repayment_date: string;
        guarantors: string[];
    } | null;
    pending_loan: {
        amount: number;
        status: string;
    } | null;
    history: {
        loan_id: number;
        created_at: string;
        loan_type: string;
        amount: number;
        status: string;
        current_balance: number;
    }[];
}

export interface TransactionData {
    transactions: {
        transaction_id: number;
        created_at: string;
        transaction_type: string;
        amount: number;
        notes: string;
        reference_no: string;
        related_table: string;
    }[];
    totals: {
        category: string;
        count: number;
    }[];
}

export const MemberApi = {
    getSavings: () => apiFetch<{status: string, data: SavingsData}>('/api/member/savings').then(res => res.data),
    getShares: () => apiFetch<{status: string, data: SharesData}>('/api/member/shares').then(res => res.data),
    getLoans: () => apiFetch<{status: string, data: LoanData}>('/api/member/loans').then(res => res.data),
    getTransactions: (type: string = 'all', limit: number = 50) => 
        apiFetch<{status: string, data: TransactionData}>(`/api/member/transactions?type=${type}&limit=${limit}`).then(res => res.data),
    downloadStatement: async (params: { start_date: string, end_date: string, report_type: string, format: string }) => {
        const formData = new FormData();
        Object.entries(params).forEach(([key, val]) => formData.append(key, val));
        
        // Use a direct axios call for blob handling
        const response = await fetch('/api/member/statements/generate', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Statement generation failed');
        return await response.blob();
    }
};
