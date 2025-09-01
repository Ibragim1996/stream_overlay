import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // не трогаем статические и api
  const path = req.nextUrl.pathname;
  if (path.startsWith('/_next') || path.startsWith('/api') || path.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // если уже есть cookie locale — оставляем
  const has = req.cookies.get('locale')?.value;
  if (has) return NextResponse.next();

  // определяем по Accept-Language
  const al = req.headers.get('accept-language') || '';
  const pref = al.slice(0, 2).toLowerCase();
  const locale = (pref === 'ru' || pref === 'es') ? pref : 'en';

  const res = NextResponse.next();
  res.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return res;
}