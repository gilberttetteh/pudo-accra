import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/layout/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/forms/Input'
import { Label } from '@/components/forms/Label'
import { Select } from '@/components/forms/Select'
import { editNodeSchema, type EditNodeFormValues } from './schemas'
import { PROVIDERS, type MockNode } from '@/mock/nodes'

/**
 * Purpose
 * -------
 * Modal form for editing an existing node's name, status, provider,
 * daily capacity, and address. Built on React Hook Form + Zod
 * (editNodeSchema) per Phase 5's requirement. Submitting calls
 * nodeStore.updateNode via the `onSubmit` prop — this component itself
 * has no store dependency, so it stays easy to test/reuse. Select
 * fields use RHF's <Controller> (rather than `register`) since our
 * Select is a controlled value/onValueChange component, not a native
 * <select> that `register`'s ref-based API targets.
 *
 * Props
 * -----
 * - open / onOpenChange
 * - node: MockNode — provides default values
 * - onSubmit: (patch: EditNodeFormValues) => void
 *
 * Example usage
 * -------------
 * <EditNodeForm open={open} onOpenChange={setOpen} node={node}
 *   onSubmit={(values) => updateNode(node.id, values)} />
 *
 * Accessibility
 * -------------
 * Every field has a real <Label htmlFor>; validation errors are
 * rendered adjacent to their field.
 *
 * Future extension
 * -----------------
 * Add a coordinates field (with map-drag sync) once "Move" is exposed
 * as a first-class editor action beyond the map's own drag-to-move
 * (not yet implemented on markers).
 */
export interface EditNodeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: MockNode
  onSubmit: (values: EditNodeFormValues) => void
}

export function EditNodeForm({ open, onOpenChange, node, onSubmit }: EditNodeFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditNodeFormValues>({
    resolver: zodResolver(editNodeSchema),
    defaultValues: {
      name: node.name,
      status: node.status,
      provider: node.provider,
      dailyCapacity: node.dailyCapacity,
      address: node.address,
    },
  })

  const submit = handleSubmit((values) => {
    onSubmit(values)
    onOpenChange(false)
  })

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
      title="Edit node"
      description={node.name}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSubmitting}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-node-name" required>
            Name
          </Label>
          <Input id="edit-node-name" error={!!errors.name} {...register('name')} />
          {errors.name && <p className="text-caption text-error-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-node-status" required>
              Status
            </Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  aria-label="Status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'offline', label: 'Offline' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-node-capacity" required>
              Daily Capacity
            </Label>
            <Input
              id="edit-node-capacity"
              type="number"
              error={!!errors.dailyCapacity}
              {...register('dailyCapacity', { valueAsNumber: true })}
            />
            {errors.dailyCapacity && (
              <p className="text-caption text-error-600">{errors.dailyCapacity.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-node-provider" required>
            Provider
          </Label>
          <Controller
            control={control}
            name="provider"
            render={({ field }) => (
              <Select
                aria-label="Provider"
                value={field.value}
                onValueChange={field.onChange}
                options={PROVIDERS.map((provider) => ({ value: provider, label: provider }))}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-node-address" required>
            Address
          </Label>
          <Input id="edit-node-address" error={!!errors.address} {...register('address')} />
          {errors.address && (
            <p className="text-caption text-error-600">{errors.address.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
