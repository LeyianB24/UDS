import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const view = searchParams.get('view') || 'hr';
        const status = searchParams.get('status') || 'all';

        let employees = [];

        if (view === 'hr') {
            let query = `
                SELECT e.*, r.name as admin_role, sg.grade_name 
                FROM employees e 
                LEFT JOIN admins a ON e.admin_id = a.admin_id 
                LEFT JOIN roles r ON a.role_id = r.id 
                LEFT JOIN salary_grades sg ON e.grade_id = sg.id 
                WHERE 1=1
            `;
            const params: any[] = [];

            if (status !== 'all') {
                query += " AND e.status = ?";
                params.push(status);
            }
            if (q) {
                query += " AND (e.full_name LIKE ? OR e.national_id LIKE ?)";
                params.push(`%${q}%`, `%${q}%`);
            }
            query += " ORDER BY e.full_name ASC";

            const [rows]: any = await pool.execute(query, params);
            employees = rows;
        } else if (view === 'leave') {
            let query = `
                SELECT e.*, sg.grade_name 
                FROM employees e 
                LEFT JOIN salary_grades sg ON e.grade_id = sg.id 
                WHERE 1=1
            `;
            const params: any[] = [];
            
            if (q) {
                query += " AND (e.full_name LIKE ? OR e.employee_no LIKE ?)";
                params.push(`%${q}%`, `%${q}%`);
            }
            query += " ORDER BY e.full_name ASC";

            const [rows]: any = await pool.execute(query, params);
            employees = rows;
        }

        // Fetch Grades and Job Titles
        const [grades]: any = await pool.execute(`SELECT * FROM salary_grades ORDER BY basic_salary DESC`);
        const [jobTitles]: any = await pool.execute(`SELECT title FROM job_titles`);

        // Stats
        let stats: any = {};
        if (view === 'hr') {
            const [totalCount]: any = await pool.execute(`SELECT COUNT(*) as c FROM employees`);
            const [payrollSum]: any = await pool.execute(`SELECT SUM(salary) as s FROM employees WHERE status='active'`);
            const [driverCount]: any = await pool.execute(`SELECT COUNT(*) as c FROM employees WHERE job_title LIKE '%Driver%' AND status='active'`);
            const [activeCount]: any = await pool.execute(`SELECT COUNT(*) as c FROM employees WHERE status='active'`);

            stats = {
                totalStaff: totalCount[0]?.c || 0,
                monthlyPayroll: payrollSum[0]?.s || 0,
                activeDrivers: driverCount[0]?.c || 0,
                activeStaff: activeCount[0]?.c || 0
            };
        } else {
            stats = {
                pendingLeave: 0,
                onLeaveToday: 0,
                leaveBalance: 'System'
            };
        }

        return NextResponse.json({
            status: 'success',
            data: {
                employees,
                grades,
                jobTitles,
                stats
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let connection;
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (action === 'add_employee') {
            const { full_name, national_id, phone, job_title, grade_id, personal_email, salary, kra_pin, nssf_no, sha_no, bank_name, bank_account, hire_date } = body;

            // Generate employee number
            let empNo = '';
            let unique = false;
            while (!unique) {
                const rand = Math.floor(Math.random() * 9000) + 1000;
                empNo = `EMP-${rand}`;
                const [rows]: any = await connection.execute(`SELECT 1 FROM employees WHERE employee_no = ?`, [empNo]);
                if (rows.length === 0) unique = true;
            }

            const company_email = `${full_name.split(' ')[0].toLowerCase()}.${full_name.split(' ')[1]?.toLowerCase() || 'emp'}@umojasacco.co.ke`;

            // Insert Employee
            const [insRes]: any = await connection.execute(
                `INSERT INTO employees (employee_no, full_name, national_id, phone, personal_email, company_email, job_title, grade_id, salary, hire_date, status, kra_pin, nssf_no, sha_no, bank_name, bank_account) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
                [empNo, full_name, national_id, phone, personal_email || '', company_email, job_title, grade_id, salary, hire_date, kra_pin || '', nssf_no || '', sha_no || '', bank_name || '', bank_account || '']
            );
            const employee_id = insRes.insertId;

            // Create System User
            const [roleRows]: any = await connection.execute(`SELECT id FROM roles WHERE name LIKE ? LIMIT 1`, [`%${job_title}%`]);
            const roleId = roleRows.length > 0 ? roleRows[0].id : 2; // Default to staff

            const defaultPassword = 'password123';
            const hashed = await bcrypt.hash(defaultPassword, 10);

            const [userRes]: any = await connection.execute(
                `INSERT INTO admins (username, email, password, full_name, role_id, status) VALUES (?, ?, ?, ?, ?, 'active')`,
                [empNo, company_email, hashed, full_name, roleId]
            );
            const admin_id = userRes.insertId;

            // Link admin to employee
            await connection.execute(`UPDATE employees SET admin_id = ? WHERE employee_id = ?`, [admin_id, employee_id]);

            await connection.commit();
            return NextResponse.json({ status: 'success', message: `Employee onboarded successfully. ID: ${empNo}` });
        }

        if (action === 'update_employee') {
            const { employee_id, full_name, phone, job_title, salary, status, kra_pin, nssf_no, sha_no } = body;
            
            await connection.execute(
                `UPDATE employees SET full_name=?, phone=?, job_title=?, salary=?, status=?, kra_pin=?, nssf_no=?, sha_no=? WHERE employee_id=?`,
                [full_name, phone, job_title, salary, status, kra_pin || '', nssf_no || '', sha_no || '', employee_id]
            );

            await connection.commit();
            return NextResponse.json({ status: 'success', message: 'Employee updated successfully.' });
        }

        throw new Error('Invalid action');

    } catch (error: any) {
        if (connection) await connection.rollback();
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
