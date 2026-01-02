import { NextRequest, NextResponse } from 'next/server'
import { createSuggestion } from '@/lib/db/suggestions'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, suggestion, category } = body

    if (!suggestion || suggestion.trim().length === 0) {
      return NextResponse.json(
        { error: 'Suggestion is required' },
        { status: 400 }
      )
    }

    if (suggestion.length > 5000) {
      return NextResponse.json(
        { error: 'Suggestion is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Create suggestion
    const suggestionId = nanoid()
    await createSuggestion({
      id: suggestionId,
      name: name?.trim() || null,
      email: email?.trim() || null,
      suggestion: suggestion.trim(),
      category: category || null,
    })

    return NextResponse.json({
      id: suggestionId,
      message: 'Thank you for your suggestion! We appreciate your feedback.',
    })
  } catch (error: any) {
    console.error('Suggestion creation error:', error)
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 })
  }
}



