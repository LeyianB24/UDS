import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'umoja-drivers-sacco-super-secret-key-2026';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hours
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function getSession() {
  const session = (await cookies()).get('uds_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function login(user: any, portal: 'admin' | 'member') {
  // Create the session payload matching PHP format expectation
  const sessionData = {
      id: user.id,
      name: user.name,
      role: portal === 'member' ? 'member' : user.role,
      portal: portal
  };
  
  const token = await encrypt(sessionData);

  // Set cookie
  (await cookies()).set('uds_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 1 day
  });
  
  return sessionData;
}

export async function logout() {
    (await cookies()).set('uds_session', '', {
        path: '/',
        expires: new Date(0) // Expire immediately
    });
}
