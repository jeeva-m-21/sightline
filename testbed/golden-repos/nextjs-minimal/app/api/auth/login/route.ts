export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ error: 'Missing credentials' }, { status: 400 });
  }

  return Response.json({ token: 'mock-jwt-token', user: { email } });
}
