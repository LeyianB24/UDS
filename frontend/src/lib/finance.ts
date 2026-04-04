import pool from './db';

export const CAT_WALLET = 'wallet';
export const CAT_SAVINGS = 'savings';
export const CAT_LOANS = 'loans';
export const CAT_SHARES = 'shares';
export const CAT_WELFARE = 'welfare';

export async function getBalances(memberId: number) {
    const balances = {
        wallet: 0,
        savings: 0,
        loans: 0,
        shares: 0,
        welfare: 0
    };

    const [rows]: any = await pool.execute(
        `SELECT category, current_balance FROM ledger_accounts WHERE member_id = ?`,
        [memberId]
    );

    rows.forEach((row: any) => {
        if (row.category in balances) {
            balances[row.category as keyof typeof balances] = parseFloat(row.current_balance);
        }
    });

    return balances;
}

export async function createTransaction(params: {
    member_id: number;
    amount: number;
    action_type: string;
    method: string;
    reference: string;
    notes: string;
    source_cat?: string;
    dest_cat?: string;
    related_id?: number | null;
    related_table?: string | null;
}) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Create Transaction Shell
        const [txnResult]: any = await connection.execute(
            `INSERT INTO ledger_transactions (reference_no, transaction_date, description, action_type, recorded_by) VALUES (?, CURDATE(), ?, ?, ?)`,
            [params.reference, params.notes, params.action_type, null]
        );
        const txnId = txnResult.insertId;

        // 2. Helper to post entry and update balance
        const postEntry = async (accountId: number, debit: number, credit: number) => {
            // Lock account for update
            const [accs]: any = await connection.execute(
                `SELECT account_type, current_balance FROM ledger_accounts WHERE account_id = ? FOR UPDATE`,
                [accountId]
            );
            const acc = accs[0];
            let newBalance = parseFloat(acc.current_balance);

            if (acc.account_type === 'asset' || acc.account_type === 'expense') {
                newBalance += (debit - credit);
            } else {
                newBalance += (credit - debit);
            }

            await connection.execute(
                `UPDATE ledger_accounts SET current_balance = ? WHERE account_id = ?`,
                [newBalance, accountId]
            );

            await connection.execute(
                `INSERT INTO ledger_entries (transaction_id, account_id, debit, credit, balance_after) VALUES (?, ?, ?, ?, ?)`,
                [txnId, accountId, debit, credit, newBalance]
            );
        };

        // 3. Helper to get or create account
        const getAccount = async (member_id: number | null, category: string): Promise<number> => {
            if (member_id === null) {
                // System Account
                const masterAccount = 'Paystack Clearing Account';
                const nameMap: any = {
                    'cash': masterAccount,
                    'mpesa': masterAccount,
                    'bank': masterAccount,
                    'paystack': masterAccount,
                    'mpesa_clearing': masterAccount,
                    'income': 'SACCO Revenue',
                    'expense': 'SACCO Expenses',
                    'welfare': 'Welfare Fund Pool'
                };
                const name = nameMap[category] || category;
                const [rows]: any = await connection.execute(`SELECT account_id FROM ledger_accounts WHERE account_name = ? LIMIT 1`, [name]);
                if (rows.length > 0) return rows[0].account_id;
                throw new Error(`System Account Missing: ${name}`);
            } else {
                const [rows]: any = await connection.execute(`SELECT account_id FROM ledger_accounts WHERE member_id = ? AND category = ?`, [member_id, category]);
                if (rows.length > 0) return rows[0].account_id;

                const types: any = { [CAT_SAVINGS]: 'liability', [CAT_LOANS]: 'asset', [CAT_WALLET]: 'liability', [CAT_SHARES]: 'equity', [CAT_WELFARE]: 'liability' };
                const type = types[category] || 'liability';
                const fullName = `Member ${member_id} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                const [ins]: any = await connection.execute(`INSERT INTO ledger_accounts (account_name, account_type, member_id, category) VALUES (?, ?, ?, ?)`, [fullName, type, member_id, category]);
                return ins.insertId;
            }
        };

        // 4. Double Entry Logic (Simplified for member portal needs)
        if (params.action_type === 'withdrawal_initiate') {
            const srcAcc = await getAccount(params.member_id, params.source_cat || CAT_WALLET);
            const clearAcc = await getAccount(null, 'mpesa_clearing');
            await postEntry(srcAcc, params.amount, 0); // Debit Member (Decrease Liability)
            await postEntry(clearAcc, 0, params.amount); // Credit Clearing (Increase Liability/Pending)
        } else if (params.action_type === 'loan_repayment') {
            const sysAcc = await getAccount(null, params.method);
            const loanAcc = await getAccount(params.member_id, CAT_LOANS);
            await postEntry(sysAcc, params.amount, 0); // Debit System (Increase Asset/Cash)
            await postEntry(loanAcc, 0, params.amount); // Credit Member Loan (Decrease Asset)
        } else if (params.action_type === 'savings_deposit') {
            const sysAcc = await getAccount(null, params.method);
            const savAcc = await getAccount(params.member_id, CAT_SAVINGS);
            await postEntry(sysAcc, params.amount, 0);
            await postEntry(savAcc, 0, params.amount);
        }

        // 5. Sync Legacy Transactions Table
        const flow = ['savings_deposit', 'loan_disbursement'].includes(params.action_type) ? 'credit' : 'debit';
        const typePrefix = params.action_type.split('_')[0];
        await connection.execute(
            `INSERT INTO transactions (ledger_transaction_id, member_id, transaction_type, amount, type, category, reference_no, related_id, related_table, recorded_by, transaction_date, notes, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, NOW())`,
            [txnId, params.member_id, params.action_type, params.amount, flow, typePrefix, params.reference, params.related_id || null, params.related_table || null, null, params.notes]
        );

        await connection.commit();
        return txnId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
