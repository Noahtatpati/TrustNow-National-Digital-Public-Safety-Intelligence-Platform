import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type EntityNode = {
  id: string
  name: string
  type: 'person' | 'organization' | 'device' | 'location'
}

type EntityEdge = {
  source: string
  target: string
  label: string
}

type NetworkGraphProps = {
  entities: EntityNode[]
  edges: EntityEdge[]
  onEntityClick?: (entity: EntityNode) => void
  className?: string
}

const typeColors: Record<string, string> = {
  person: '#B22222',
  organization: '#D97706',
  device: '#666666',
  location: '#4D7C0F',
}

const typeLabels: Record<string, string> = {
  person: 'Person',
  organization: 'Organization',
  device: 'Device',
  location: 'Location',
}

function EntityNode({ data }: NodeProps) {
  const entityData = data as { label?: string; entityType?: string }
  const color = typeColors[entityData.entityType as string] || '#999'
  const label = typeLabels[entityData.entityType as string] || 'Entity'

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-white border-2 rounded-sm shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md group"
      style={{ borderColor: color }}
    >
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#161616] leading-tight truncate max-w-[120px]">
          {entityData.label || 'Entity'}
        </p>
        <p className="text-[9px] text-[#666] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  entity: EntityNode,
}

export function NetworkGraph({ entities, edges: edgeData, onEntityClick, className }: NetworkGraphProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      entities.map((entity, i) => {
        const angle = (2 * Math.PI * i) / entities.length
        const radius = Math.min(250, entities.length * 40)
        return {
          id: entity.id,
          type: 'entity',
          position: {
            x: 300 + radius * Math.cos(angle),
            y: 250 + radius * Math.sin(angle),
          },
          data: {
            label: entity.name,
            entityType: entity.type,
            entityId: entity.id,
          },
        }
      }),
    [entities]
  )

  const initialEdges: Edge[] = useMemo(
    () =>
      edgeData.map((e, i) => ({
        id: `edge-${i}`,
        source: entities.find((en) => en.name === e.source)?.id || '',
        target: entities.find((en) => en.name === e.target)?.id || '',
        label: e.label,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#D9D9D9', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#D9D9D9' },
        labelStyle: { fontSize: 9, fill: '#666', fontWeight: 500 },
        labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.9 },
      })),
    [edgeData, entities]
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edgesState, , onEdgesChange] = useEdgesState(initialEdges)
  const [selectedEntity, setSelectedEntity] = useState<EntityNode | null>(null)

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const entity = entities.find((e) => e.id === node.id)
      if (entity) {
        setSelectedEntity(entity)
        onEntityClick?.(entity)
      }
    },
    [entities, onEntityClick]
  )

  const onPaneClick = useCallback(() => {
    setSelectedEntity(null)
  }, [])

  return (
    <div className={className} style={{ width: '100%', height: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#D9D9D9', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#D9D9D9' },
        }}
      >
        <Controls showInteractive={false} className="!border !border-[#E6E6E6] !rounded-sm !shadow-none" />
        <Background color="#F0EFEA" gap={20} size={1} />
      </ReactFlow>

      {selectedEntity && (
        <div className="absolute top-3 right-3 z-10 w-64 bg-white border border-[#E6E6E6] rounded-sm shadow-sm p-4">
          <button
            onClick={() => setSelectedEntity(null)}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[#999] hover:text-[#161616] transition-colors cursor-pointer"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: typeColors[selectedEntity.type] || '#999' }}
            />
            <div>
              <p className="text-sm font-semibold text-[#161616]">{selectedEntity.name}</p>
              <p className="text-[10px] text-[#666] uppercase tracking-wider">{typeLabels[selectedEntity.type] || selectedEntity.type}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-[#666]">
            <div className="flex justify-between py-1 border-b border-[#E6E6E6]">
              <span>Entity ID</span>
              <span className="font-mono text-[#161616]">{selectedEntity.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E6E6]">
              <span>Connected Cases</span>
              <span className="font-medium text-[#161616]">
                {edgeData.filter((e) => e.source === selectedEntity.name || e.target === selectedEntity.name).length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E6E6E6]">
              <span>Risk Score</span>
              <span className="font-medium text-[#B22222]">
                {selectedEntity.type === 'person' ? '85/100' : selectedEntity.type === 'organization' ? '72/100' : '45/100'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
