import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const [roles]: any = await pool.execute(`SELECT * FROM roles ORDER BY id ASC`);
        
        const [permissions]: any = await pool.execute(`SELECT * FROM permissions ORDER BY category, name ASC`);
        
        const [rolePermissions]: any = await pool.execute(`SELECT * FROM role_permissions`);

        // Group permissions by category
        const permsByCategory: any = {};
        permissions.forEach((p: any) => {
            if (!permsByCategory[p.category]) permsByCategory[p.category] = [];
            permsByCategory[p.category].push(p);
        });

        // Group active permissions by role
        const activeMap: any = {};
        rolePermissions.forEach((m: any) => {
            if (!activeMap[m.role_id]) activeMap[m.role_id] = [];
            activeMap[m.role_id].push(m.permission_id);
        });

        return NextResponse.json({
            status: 'success',
            data: {
                roles,
                permissionsByCategory: permsByCategory,
                activePermissionsMap: activeMap
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.portal !== 'admin') {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'toggle_permission') {
            const { role_id, perm_id, status } = body;
            
            if (role_id === 1) {
                return NextResponse.json({ status: 'error', message: 'Superadmin permissions are locked.' });
            }

            if (status) {
                await pool.execute(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [role_id, perm_id]);
            } else {
                await pool.execute(`DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`, [role_id, perm_id]);
            }

            return NextResponse.json({ status: 'success' });
        }

        if (action === 'add_role') {
            const { role_name, role_desc } = body;
            await pool.execute(`INSERT INTO roles (name, description) VALUES (?, ?)`, [role_name, role_desc]);
            return NextResponse.json({ status: 'success', message: 'Role created successfully.' });
        }

        if (action === 'edit_role') {
            const { role_id, role_name, role_desc } = body;
            if (role_id === 1) {
                return NextResponse.json({ status: 'error', message: 'Cannot edit Superadmin role.' });
            }
            await pool.execute(`UPDATE roles SET name = ?, description = ? WHERE id = ?`, [role_name, role_desc, role_id]);
            return NextResponse.json({ status: 'success', message: 'Role updated successfully.' });
        }

        if (action === 'delete_role') {
            const { role_id } = body;
            if (role_id === 1) {
                return NextResponse.json({ status: 'error', message: 'Cannot delete Superadmin role.' });
            }

            const [check]: any = await pool.execute(`SELECT COUNT(*) as c FROM admins WHERE role_id = ?`, [role_id]);
            if (check[0].c > 0) {
                return NextResponse.json({ status: 'error', message: \`Cannot delete: \${check[0].c} users are assigned to this role.\` });
            }

            await pool.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [role_id]);
            await pool.execute(`DELETE FROM roles WHERE id = ?`, [role_id]);
            
            return NextResponse.json({ status: 'success', message: 'Role deleted successfully.' });
        }

        return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
