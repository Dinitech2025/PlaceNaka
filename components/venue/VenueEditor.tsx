'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const Stage = dynamic(() => import('react-konva').then(m => m.Stage), { ssr: false })
const Layer = dynamic(() => import('react-konva').then(m => m.Layer), { ssr: false })
const Rect = dynamic(() => import('react-konva').then(m => m.Rect), { ssr: false })
const Circle = dynamic(() => import('react-konva').then(m => m.Circle), { ssr: false })
const Text = dynamic(() => import('react-konva').then(m => m.Text), { ssr: false })
const Transformer = dynamic(() => import('react-konva').then(m => m.Transformer), { ssr: false })

export type VenueElement = {
  id: string
  type: 'table' | 'chair' | 'stage' | 'wall' | 'entrance'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  rotation?: number
  label?: string
  color?: string
  seats?: number
}

interface VenueEditorProps {
  initialLayout?: VenueElement[]
  onChange?: (elements: VenueElement[]) => void
  readonly?: boolean
  selectedTicketId?: string
  ticketPositions?: { id: string; x: number; y: number; color: string; label: string; available: number }[]
  onTicketSelect?: (ticketId: string) => void
}

const TOOLS = [
  { type: 'table', label: 'Table', icon: '⬜', color: '#8B5CF6' },
  { type: 'chair', label: 'Chaise', icon: '🪑', color: '#3B82F6' },
  { type: 'stage', label: 'Scène', icon: '🎭', color: '#F59E0B' },
  { type: 'wall', label: 'Mur', icon: '🧱', color: '#6B7280' },
  { type: 'entrance', label: 'Entrée', icon: '🚪', color: '#10B981' },
] as const

export default function VenueEditor({
  initialLayout = [],
  onChange,
  readonly = false,
  ticketPositions = [],
  onTicketSelect,
}: VenueEditorProps) {
  const [elements, setElements] = useState<VenueElement[]>(initialLayout)
  const [selectedTool, setSelectedTool] = useState<VenueElement['type']>('table')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stageRef = useRef<any>(null)

  const addElement = useCallback((e: any) => {
    if (readonly) return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    const tool = TOOLS.find(t => t.type === selectedTool)!
    const id = `${selectedTool}-${Date.now()}`
    const newEl: VenueElement = {
      id,
      type: selectedTool,
      x: pos.x,
      y: pos.y,
      color: tool.color,
      label: tool.label,
      ...(selectedTool === 'table' ? { width: 80, height: 60, seats: 4 } : {}),
      ...(selectedTool === 'chair' ? { radius: 15 } : {}),
      ...(selectedTool === 'stage' ? { width: 200, height: 80 } : {}),
      ...(selectedTool === 'wall' ? { width: 100, height: 15 } : {}),
      ...(selectedTool === 'entrance' ? { width: 50, height: 30 } : {}),
    }

    const updated = [...elements, newEl]
    setElements(updated)
    onChange?.(updated)
  }, [elements, selectedTool, readonly, onChange])

  const removeSelected = () => {
    if (!selectedId) return
    const updated = elements.filter(el => el.id !== selectedId)
    setElements(updated)
    setSelectedId(null)
    onChange?.(updated)
  }

  const clearAll = () => {
    setElements([])
    setSelectedId(null)
    onChange?.([])
  }

  return (
    <div className="flex flex-col gap-3">
      {!readonly && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded-xl">
          {TOOLS.map(tool => (
            <button
              key={tool.type}
              onClick={() => setSelectedTool(tool.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTool === tool.type
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <span>{tool.icon}</span>
              {tool.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {selectedId && (
              <button
                onClick={removeSelected}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500"
            >
              Effacer tout
            </button>
          </div>
        </div>
      )}

      <div className="border-2 border-gray-700 rounded-xl overflow-hidden bg-gray-900">
        <Stage
          ref={stageRef}
          width={700}
          height={450}
          onClick={readonly ? undefined : addElement}
          className="cursor-crosshair"
        >
          <Layer>
            {/* Grille de fond */}
            {Array.from({ length: 15 }).map((_, i) => (
              <Rect
                key={`hg-${i}`}
                x={0} y={i * 30} width={700} height={1}
                fill="#1f2937" opacity={0.5}
              />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <Rect
                key={`vg-${i}`}
                x={i * 30} y={0} width={1} height={450}
                fill="#1f2937" opacity={0.5}
              />
            ))}

            {/* Éléments du plan */}
            {elements.map(el => {
              const isSelected = el.id === selectedId
              if (el.type === 'chair') {
                return (
                  <Circle
                    key={el.id}
                    x={el.x} y={el.y}
                    radius={el.radius || 15}
                    fill={el.color || '#3B82F6'}
                    stroke={isSelected ? '#fff' : 'transparent'}
                    strokeWidth={2}
                    onClick={e => { e.cancelBubble = true; setSelectedId(el.id) }}
                    draggable={!readonly}
                    onDragEnd={e => {
                      const updated = elements.map(item =>
                        item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                      )
                      setElements(updated)
                      onChange?.(updated)
                    }}
                  />
                )
              }
              return (
                <Rect
                  key={el.id}
                  x={el.x - (el.width || 80) / 2}
                  y={el.y - (el.height || 60) / 2}
                  width={el.width || 80}
                  height={el.height || 60}
                  fill={el.color || '#8B5CF6'}
                  cornerRadius={el.type === 'table' ? 8 : 4}
                  stroke={isSelected ? '#fff' : 'transparent'}
                  strokeWidth={2}
                  opacity={0.85}
                  onClick={e => { e.cancelBubble = true; setSelectedId(el.id) }}
                  draggable={!readonly}
                  onDragEnd={e => {
                    const updated = elements.map(item =>
                      item.id === el.id ? { ...item, x: e.target.x() + (el.width || 80) / 2, y: e.target.y() + (el.height || 60) / 2 } : item
                    )
                    setElements(updated)
                    onChange?.(updated)
                  }}
                />
              )
            })}

            {/* Labels des éléments */}
            {elements.map(el => (
              <Text
                key={`lbl-${el.id}`}
                x={el.x - 20} y={el.y - 6}
                text={el.label || ''}
                fontSize={9}
                fill="white"
                align="center"
                width={40}
              />
            ))}

            {/* Positions des billets (mode readonly/réservation) */}
            {ticketPositions.map(tp => (
              <Circle
                key={tp.id}
                x={tp.x} y={tp.y}
                radius={18}
                fill={tp.available > 0 ? tp.color : '#4B5563'}
                opacity={tp.available > 0 ? 0.9 : 0.4}
                stroke={tp.id === 'selected' ? '#fff' : 'transparent'}
                strokeWidth={3}
                onClick={() => tp.available > 0 && onTicketSelect?.(tp.id)}
                style={{ cursor: tp.available > 0 ? 'pointer' : 'not-allowed' }}
              />
            ))}
            {ticketPositions.map(tp => (
              <Text
                key={`tlbl-${tp.id}`}
                x={tp.x - 15} y={tp.y - 6}
                text={tp.label}
                fontSize={9}
                fill="white"
                align="center"
                width={30}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {!readonly && (
        <p className="text-xs text-gray-400 text-center">
          Cliquez sur le plan pour ajouter un élément • Cliquez sur un élément pour le sélectionner • Glissez pour déplacer
        </p>
      )}
    </div>
  )
}
