import { NextResponse, type NextRequest } from 'next/server'

// 🔓 AUTH DÉSACTIVÉE — Mode développement
// Toutes les routes sont accessibles sans connexion
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
