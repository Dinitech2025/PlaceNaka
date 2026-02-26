import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  venueId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  tickets: z.array(z.object({
    name: z.string(),
    price: z.number().int().nonnegative(),
    quantity: z.number().int().positive(),
    posX: z.number().optional(),
    posY: z.number().optional(),
    color: z.string().optional(),
  })).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PUBLISHED'
  const city = searchParams.get('city')

  const events = await prisma.event.findMany({
    where: {
      status: status as any,
      ...(city ? { venue: { city: { contains: city, mode: 'insensitive' } } } : {}),
    },
    include: {
      venue: { select: { name: true, city: true, address: true } },
      organizer: { select: { name: true } },
      _count: { select: { tickets: true, reservations: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ORGANIZER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tickets, ...eventData } = schema.parse(body)

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        organizerId: session.user.id,
        tickets: tickets ? {
          create: tickets.map(t => ({
            ...t,
            available: t.quantity,
          })),
        } : undefined,
      },
      include: { tickets: true },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
