import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  capacity: z.number().int().positive(),
  layout: z.any().optional(),
  images: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')

  const venues = await prisma.venue.findMany({
    where: city ? { city: { contains: city, mode: 'insensitive' } } : undefined,
    include: { organizer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(venues)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ORGANIZER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const venue = await prisma.venue.create({
      data: {
        ...data,
        organizerId: session.user.id,
      },
    })

    return NextResponse.json(venue, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
