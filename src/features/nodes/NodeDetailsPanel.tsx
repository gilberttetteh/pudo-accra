import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/layout/Tabs'
import { Icon, MapPin, Route, Layers as LayersIcon } from '@/components/icons'
import {
  formatCoordinate,
  formatPercent,
  formatDistance,
  formatDate,
  formatRelativeTime,
} from '@/utils/formatters'
import { haversineDistanceMeters } from '@/utils/geo'
import { MOCK_ROAD_SEGMENTS } from '@/mock/roads'
import { MOCK_COVERAGE_POLYGONS } from '@/mock/coverage'
import { generateAuditTrail, type MockNode, type MockCandidateNode } from '@/mock/nodes'
import { ConfirmDialog } from './ConfirmDialog'
import { NODE_STATUS_TONE } from './types'
import { EditNodeForm } from './forms/EditNodeForm'
import { useNodeStore } from '@/store/nodeStore'
import { useToast } from '@/components/feedback/Toast'

/**
 * Purpose
 * -------
 * The reusable Node Details panel — General Information, Coordinates,
 * Coverage Metrics, Accessibility, Nearest Roads, Connected Coverage
 * Areas, History, Audit Trail, and Actions, all from Phase 5's spec.
 * "Reusable" in the sense that it's a self-contained component taking
 * only a node + kind (not tied to InspectorPanel's shell) — Inspector
 * Panel (features/map) renders this as its body content, but it could
 * equally be used in a future full-page node detail route.
 *
 * Props
 * -----
 * - node: (MockNode & { kind: 'existing' }) | (MockCandidateNode & { kind: 'candidate' })
 *
 * Example usage
 * -------------
 * <NodeDetailsPanel node={{ kind: 'existing', ...node }} />
 *
 * Accessibility
 * -------------
 * Built on Tabs (Radix-backed); every action is a real, labeled Button;
 * destructive/consequential actions go through ConfirmDialog.
 *
 * Future extension
 * -----------------
 * Add a coverage/accessibility trend chart once Chart.js is wired
 * (Phase 8) — History currently shows discrete audit events, not a
 * continuous metric trend.
 */
export type NodeDetailsTarget =
  ({ kind: 'existing' } & MockNode) | ({ kind: 'candidate' } & MockCandidateNode)

const statusTone = NODE_STATUS_TONE

export function NodeDetailsPanel({ node }: { node: NodeDetailsTarget }) {
  const [dialog, setDialog] = useState<'edit' | 'approve' | 'reject' | 'archive' | 'delete' | null>(
    null
  )

  const updateNode = useNodeStore((state) => state.updateNode)
  const archiveNode = useNodeStore((state) => state.archiveNode)
  const approveCandidate = useNodeStore((state) => state.approveCandidate)
  const rejectCandidate = useNodeStore((state) => state.rejectCandidate)
  const deleteCandidate = useNodeStore((state) => state.deleteCandidate)
  const { showToast } = useToast()

  const [lat, lng] = Array.isArray(node.position)
    ? node.position
    : [node.position.lat, node.position.lng]

  const nearestRoads = useMemo(() => {
    return MOCK_ROAD_SEGMENTS.map((road) => ({
      road,
      distance: Math.min(
        ...road.positions.map((point) => haversineDistanceMeters(node.position, point))
      ),
    }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }, [node.position])

  const connectedCoverageAreas = useMemo(
    () => MOCK_COVERAGE_POLYGONS.filter((polygon) => polygon.neighbourhood === node.neighbourhood),
    [node.neighbourhood]
  )

  const auditTrail = useMemo(() => generateAuditTrail(node.id), [node.id])

  const primaryScore = node.kind === 'existing' ? node.coverageScore : node.suitabilityScore
  const primaryScoreLabel = node.kind === 'existing' ? 'Coverage' : 'Suitability'

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-h4 text-text-primary">{node.name}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-caption text-text-tertiary">
              <Icon icon={MapPin} size={12} />
              {node.neighbourhood} · {node.provider}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={statusTone[node.status as keyof typeof statusTone] ?? 'neutral'}>
              {node.status.replace('-', ' ')}
            </Badge>
            <Badge tone={node.kind === 'existing' ? 'primary' : 'info'}>
              {node.kind === 'existing' ? 'Existing node' : 'Candidate node'}
            </Badge>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="flex flex-col gap-4">
                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    General Information
                  </p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-small">
                    <div>
                      <dt className="text-caption text-text-tertiary">Address</dt>
                      <dd className="text-text-primary">{node.address}</dd>
                    </div>
                    <div>
                      <dt className="text-caption text-text-tertiary">Last updated</dt>
                      <dd className="text-text-primary">{formatDate(node.lastUpdated)}</dd>
                    </div>
                  </dl>
                </section>

                <Divider />

                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    Coordinates
                  </p>
                  <p className="font-mono text-small text-text-primary">
                    {formatCoordinate(lat, lng, 6)}
                  </p>
                </section>

                <Divider />

                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    Coverage Metrics
                  </p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-small">
                    <div>
                      <dt className="text-caption text-text-tertiary">{primaryScoreLabel}</dt>
                      <dd className="text-text-primary">{formatPercent(primaryScore)}</dd>
                    </div>
                    {node.kind === 'existing' && (
                      <div>
                        <dt className="text-caption text-text-tertiary">Daily Capacity</dt>
                        <dd className="text-text-primary">{node.dailyCapacity} parcels</dd>
                      </div>
                    )}
                    {node.kind === 'candidate' && (
                      <div>
                        <dt className="text-caption text-text-tertiary">Coverage Gain</dt>
                        <dd className="text-text-primary">
                          +{formatPercent(node.estimatedCoverageGain)}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-caption text-text-tertiary">Risk Level</dt>
                      <dd className="capitalize text-text-primary">{node.riskLevel}</dd>
                    </div>
                  </dl>
                </section>

                <Divider />

                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    Accessibility
                  </p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-small">
                    <div>
                      <dt className="text-caption text-text-tertiary">Accessibility score</dt>
                      <dd className="text-text-primary">
                        {formatPercent(node.accessibilityScore)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption text-text-tertiary">Distance to road</dt>
                      <dd className="text-text-primary">
                        {formatDistance(node.nearestRoadDistanceMeters)}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="context">
              <div className="flex flex-col gap-4">
                <section>
                  <p className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    <Icon icon={Route} size={12} />
                    Nearest Roads
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {nearestRoads.map(({ road, distance }) => (
                      <li key={road.id} className="flex items-center justify-between text-small">
                        <span className="text-text-primary">{road.name}</span>
                        <span className="text-caption text-text-tertiary">
                          {formatDistance(distance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <Divider />

                <section>
                  <p className="mb-1.5 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    <Icon icon={LayersIcon} size={12} />
                    Connected Coverage Areas
                  </p>
                  {connectedCoverageAreas.length === 0 ? (
                    <p className="text-small text-text-tertiary">
                      No coverage polygon for this neighbourhood yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {connectedCoverageAreas.map((area) => (
                        <li key={area.id} className="flex items-center justify-between text-small">
                          <span className="text-text-primary">
                            {area.neighbourhood} coverage area
                          </span>
                          <span className="text-caption text-text-tertiary">
                            {formatPercent(area.coverageScore)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex flex-col gap-4">
                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    History
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {auditTrail.slice(0, 4).map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between text-small">
                        <span className="text-text-primary">{entry.action}</span>
                        <span className="text-caption text-text-tertiary">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <Divider />

                <section>
                  <p className="mb-1.5 text-caption font-semibold uppercase tracking-wide text-text-tertiary">
                    Audit Trail
                  </p>
                  <ul className="flex flex-col gap-3">
                    {auditTrail.map((entry) => (
                      <li key={entry.id} className="text-small">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{entry.action}</span>
                          <span className="text-caption text-text-tertiary">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary">{entry.description}</p>
                        <p className="text-caption text-text-tertiary">by {entry.actor}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
        {node.kind === 'existing' && (
          <>
            <Button variant="outline" size="sm" onClick={() => setDialog('edit')}>
              Edit node
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialog('archive')}
              disabled={node.status === 'archived'}
            >
              Archive
            </Button>
          </>
        )}
        {node.kind === 'candidate' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog('approve')}
              disabled={node.status === 'approved'}
            >
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialog('reject')}
              disabled={node.status === 'rejected'}
            >
              Reject
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDialog('delete')}>
              Delete
            </Button>
          </>
        )}
      </div>

      {node.kind === 'existing' && (
        <EditNodeForm
          open={dialog === 'edit'}
          onOpenChange={(open) => setDialog(open ? 'edit' : null)}
          node={node}
          onSubmit={(values) => {
            updateNode(node.id, values)
            showToast({ tone: 'success', title: 'Node updated', description: node.name })
          }}
        />
      )}

      <ConfirmDialog
        open={dialog === 'archive'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Archive ${node.name}?`}
        description="Archived nodes are hidden from active views but retained in history."
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={() => {
          archiveNode(node.id)
          showToast({ tone: 'success', title: 'Node archived', description: node.name })
        }}
      />
      <ConfirmDialog
        open={dialog === 'approve'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Approve ${node.name}?`}
        confirmLabel="Approve"
        onConfirm={() => {
          approveCandidate(node.id)
          showToast({ tone: 'success', title: 'Candidate approved', description: node.name })
        }}
      />
      <ConfirmDialog
        open={dialog === 'reject'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Reject ${node.name}?`}
        confirmLabel="Reject"
        tone="destructive"
        onConfirm={() => {
          rejectCandidate(node.id)
          showToast({ tone: 'success', title: 'Candidate rejected', description: node.name })
        }}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Delete ${node.name}?`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={() => {
          deleteCandidate(node.id)
          showToast({ tone: 'success', title: 'Candidate deleted', description: node.name })
        }}
      />
    </div>
  )
}
