// // app/api/users/list/route.ts
// import { NextResponse } from 'next/server'
// import { getSupabaseAuth } from '@/lib/supabaseAuth'

// export async function GET(request: Request) {
//   const { supabase, error } = await getSupabaseAuth(request)

//   if (error) {
//     return NextResponse.json({ error }, { status: 401 })
//   }

//   try {
//     const { data, error: fetchError } = await supabase!
//       .from('users')
//       .select(
//         'id, first_name, last_name, email, role, created_at, status, avatar'
//       )

//     if (fetchError) {
//       return NextResponse.json({ error: fetchError.message }, { status: 500 })
//     }

//     return NextResponse.json({ users: data }, { status: 200 })
//   } catch (err) {
//     console.error('Error fetching users:', err)
//     return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
//   }
// }

// app/api/users/list/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuth } from '@/lib/supabaseAuth'

export async function GET(request: Request) {
  const { supabase, error } = await getSupabaseAuth(request)

  if (error) {
    return NextResponse.json({ error }, { status: 401 })
  }

  // Obtener los query params de paginación
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const {
      data,
      count,
      error: fetchError,
    } = await supabase!
      .from('users')
      .select(
        'id, first_name, last_name, email, role, created_at, status, avatar',
        { count: 'exact' }
      )
      .range(from, to)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        users: data,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error fetching users:', err)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}
