import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ success: false }, { status: 400 });

    const secret = process.env.RECAPTCHA_SECRET || process.env.RECAPTCHA_SERVER_KEY;
    if (!secret) return NextResponse.json({ success: false, error: 'Missing secret' }, { status: 500 });

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
    });

    const data = await res.json();
    // forward Google's response
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
