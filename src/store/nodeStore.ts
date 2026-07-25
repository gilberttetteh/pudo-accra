import { createStore } from '@/store/createStore'
import { emitMapEvent } from '@/store/eventBus'
import {
  MOCK_EXISTING_NODES,
  MOCK_CANDIDATE_NODES,
  type MockNode,
  type MockCandidateNode,
  type NodeStatus,
  type Provider,
} from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Owns node **data** (existing + candidate arrays) and every mutation
 * against it — separate from mapStore, which owns viewport/interaction
 * state. This split matters because node data has very different update
 * semantics: mutations are infrequent, meaningful, and undoable, while
 * viewport state (zoom/pan) is frequent and ephemeral. Every mutating
 * action here does three things: (1) update the arrays, (2) push an
 * inverse-operation Command onto the undo stack, (3) emit the matching
 * eventBus event so other features can react without importing this
 * store directly.
 *
 * Usage
 * -----
 * const existingNodes = useNodeStore((s) => s.existingNodes)
 * const updateNode = useNodeStore((s) => s.updateNode)
 * updateNode(id, { status: 'maintenance' })
 *
 * Undo/redo
 * ---------
 * useNodeStore.getState().undo() / .redo()
 * Each Command stores just enough to reverse itself (usually a
 * before/after snapshot of the single changed record) — see the Command
 * type below.
 *
 * Future extension
 * -----------------
 * Phase 10: back this with TanStack Query mutations against
 * NodeService; undo becomes either an optimistic-update rollback or a
 * real "undo" API call, but the Command shape (label + undo + redo
 * closures) doesn't need to change.
 */

export interface Command {
  label: string
  undo: () => void
  redo: () => void
}

interface NodeState {
  existingNodes: MockNode[]
  candidateNodes: MockCandidateNode[]

  updateNode: (id: string, patch: Partial<MockNode>) => void
  archiveNode: (id: string) => void

  addCandidate: (candidate: MockCandidateNode) => void
  updateCandidate: (id: string, patch: Partial<MockCandidateNode>) => void
  deleteCandidate: (id: string) => void
  approveCandidate: (id: string) => void
  rejectCandidate: (id: string) => void

  bulkChangeStatus: (ids: string[], status: NodeStatus) => void
  bulkAssignProvider: (ids: string[], provider: Provider) => void
  bulkDeleteCandidates: (ids: string[]) => void
  bulkApproveCandidates: (ids: string[]) => void
  bulkRejectCandidates: (ids: string[]) => void

  undoStack: Command[]
  redoStack: Command[]
  pushCommand: (command: Command) => void
  undo: () => void
  redo: () => void
}

export const useNodeStore = createStore<NodeState>((set, get) => {
  function runCommand(command: Command, applyNow: () => void) {
    applyNow()
    set((state) => ({ undoStack: [...state.undoStack, command], redoStack: [] }))
  }

  return {
    existingNodes: MOCK_EXISTING_NODES,
    candidateNodes: MOCK_CANDIDATE_NODES,

    updateNode: (id, patch) => {
      const before = get().existingNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (data: Partial<MockNode>) =>
        set((state) => ({
          existingNodes: state.existingNodes.map((node) =>
            node.id === id ? { ...node, ...data } : node
          ),
        }))
      runCommand(
        {
          label: `Edit ${before.name}`,
          undo: () => apply(before),
          redo: () => apply(patch),
        },
        () => apply(patch)
      )
      emitMapEvent('NodeSelected', { nodeId: id })
    },

    archiveNode: (id) => {
      const before = get().existingNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (status: NodeStatus) =>
        set((state) => ({
          existingNodes: state.existingNodes.map((node) =>
            node.id === id ? { ...node, status } : node
          ),
        }))
      runCommand(
        {
          label: `Archive ${before.name}`,
          undo: () => apply(before.status),
          redo: () => apply('archived'),
        },
        () => apply('archived')
      )
    },

    addCandidate: (candidate) => {
      const apply = (add: boolean) =>
        set((state) => ({
          candidateNodes: add
            ? [...state.candidateNodes, candidate]
            : state.candidateNodes.filter((node) => node.id !== candidate.id),
        }))
      runCommand(
        {
          label: `Add candidate ${candidate.name}`,
          undo: () => apply(false),
          redo: () => apply(true),
        },
        () => apply(true)
      )
      emitMapEvent('CandidateCreated', { candidateId: candidate.id, position: candidate.position })
    },

    updateCandidate: (id, patch) => {
      const before = get().candidateNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (data: Partial<MockCandidateNode>) =>
        set((state) => ({
          candidateNodes: state.candidateNodes.map((node) =>
            node.id === id ? { ...node, ...data } : node
          ),
        }))
      runCommand(
        { label: `Edit ${before.name}`, undo: () => apply(before), redo: () => apply(patch) },
        () => apply(patch)
      )
    },

    deleteCandidate: (id) => {
      const before = get().candidateNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (present: boolean) =>
        set((state) => ({
          candidateNodes: present
            ? [...state.candidateNodes, before].sort((a, b) => a.id.localeCompare(b.id))
            : state.candidateNodes.filter((node) => node.id !== id),
        }))
      runCommand(
        { label: `Delete ${before.name}`, undo: () => apply(true), redo: () => apply(false) },
        () => apply(false)
      )
      emitMapEvent('CandidateDeleted', { candidateId: id })
    },

    approveCandidate: (id) => {
      const before = get().candidateNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (status: MockCandidateNode['status']) =>
        set((state) => ({
          candidateNodes: state.candidateNodes.map((node) =>
            node.id === id ? { ...node, status } : node
          ),
        }))
      runCommand(
        {
          label: `Approve ${before.name}`,
          undo: () => apply(before.status),
          redo: () => apply('approved'),
        },
        () => apply('approved')
      )
    },

    rejectCandidate: (id) => {
      const before = get().candidateNodes.find((node) => node.id === id)
      if (!before) return
      const apply = (status: MockCandidateNode['status']) =>
        set((state) => ({
          candidateNodes: state.candidateNodes.map((node) =>
            node.id === id ? { ...node, status } : node
          ),
        }))
      runCommand(
        {
          label: `Reject ${before.name}`,
          undo: () => apply(before.status),
          redo: () => apply('rejected'),
        },
        () => apply('rejected')
      )
    },

    bulkChangeStatus: (ids, status) => {
      const before = get()
        .existingNodes.filter((node) => ids.includes(node.id))
        .map((node) => ({ id: node.id, status: node.status }))
      const apply = (statuses: { id: string; status: NodeStatus }[] | NodeStatus) =>
        set((state) => ({
          existingNodes: state.existingNodes.map((node) => {
            if (!ids.includes(node.id)) return node
            const target =
              typeof statuses === 'string'
                ? statuses
                : statuses.find((s) => s.id === node.id)?.status
            return target ? { ...node, status: target } : node
          }),
        }))
      runCommand(
        {
          label: `Change status for ${ids.length} nodes`,
          undo: () => apply(before),
          redo: () => apply(status),
        },
        () => apply(status)
      )
    },

    bulkAssignProvider: (ids, provider) => {
      const before = get()
        .existingNodes.filter((node) => ids.includes(node.id))
        .map((node) => ({ id: node.id, provider: node.provider }))
      const apply = (providers: { id: string; provider: Provider }[] | Provider) =>
        set((state) => ({
          existingNodes: state.existingNodes.map((node) => {
            if (!ids.includes(node.id)) return node
            const target =
              typeof providers === 'string'
                ? providers
                : providers.find((p) => p.id === node.id)?.provider
            return target ? { ...node, provider: target } : node
          }),
        }))
      runCommand(
        {
          label: `Assign provider for ${ids.length} nodes`,
          undo: () => apply(before),
          redo: () => apply(provider),
        },
        () => apply(provider)
      )
    },

    bulkDeleteCandidates: (ids) => {
      const before = get().candidateNodes.filter((node) => ids.includes(node.id))
      const apply = (present: boolean) =>
        set((state) => ({
          candidateNodes: present
            ? [...state.candidateNodes, ...before]
            : state.candidateNodes.filter((node) => !ids.includes(node.id)),
        }))
      runCommand(
        {
          label: `Delete ${ids.length} candidates`,
          undo: () => apply(true),
          redo: () => apply(false),
        },
        () => apply(false)
      )
    },

    bulkApproveCandidates: (ids) => {
      const before = get()
        .candidateNodes.filter((node) => ids.includes(node.id))
        .map((node) => ({ id: node.id, status: node.status }))
      const apply = (
        statuses: { id: string; status: MockCandidateNode['status'] }[] | 'approved'
      ) =>
        set((state) => ({
          candidateNodes: state.candidateNodes.map((node) => {
            if (!ids.includes(node.id)) return node
            const target =
              statuses === 'approved' ? 'approved' : statuses.find((s) => s.id === node.id)?.status
            return target ? { ...node, status: target } : node
          }),
        }))
      runCommand(
        {
          label: `Approve ${ids.length} candidates`,
          undo: () => apply(before),
          redo: () => apply('approved'),
        },
        () => apply('approved')
      )
    },

    bulkRejectCandidates: (ids) => {
      const before = get()
        .candidateNodes.filter((node) => ids.includes(node.id))
        .map((node) => ({ id: node.id, status: node.status }))
      const apply = (
        statuses: { id: string; status: MockCandidateNode['status'] }[] | 'rejected'
      ) =>
        set((state) => ({
          candidateNodes: state.candidateNodes.map((node) => {
            if (!ids.includes(node.id)) return node
            const target =
              statuses === 'rejected' ? 'rejected' : statuses.find((s) => s.id === node.id)?.status
            return target ? { ...node, status: target } : node
          }),
        }))
      runCommand(
        {
          label: `Reject ${ids.length} candidates`,
          undo: () => apply(before),
          redo: () => apply('rejected'),
        },
        () => apply('rejected')
      )
    },

    undoStack: [],
    redoStack: [],
    pushCommand: (command) =>
      set((state) => ({ undoStack: [...state.undoStack, command], redoStack: [] })),
    undo: () => {
      const stack = get().undoStack
      const command = stack[stack.length - 1]
      if (!command) return
      command.undo()
      set((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, command],
      }))
    },
    redo: () => {
      const stack = get().redoStack
      const command = stack[stack.length - 1]
      if (!command) return
      command.redo()
      set((state) => ({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, command],
      }))
    },
  }
})
