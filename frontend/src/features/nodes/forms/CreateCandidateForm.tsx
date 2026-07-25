import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/layout/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/forms/Input'
import { Label } from '@/components/forms/Label'
import { Select } from '@/components/forms/Select'
import { createCandidateSchema, type CreateCandidateFormValues } from './schemas'
import { PROVIDERS } from '@/mock/nodes'
import { MAP_CONFIG } from '@/constants/map'

/**
 * Purpose
 * -------
 * Modal form for manually creating a candidate node from the Node
 * Management panel (distinct from the map's right-click "Add candidate
 * here", which skips the form and drops a candidate at the clicked
 * point — this form is for when a planner wants to specify exact
 * details up front). Built on React Hook Form + Zod
 * (createCandidateSchema).
 *
 * Props
 * -----
 * - open / onOpenChange
 * - onSubmit: (values: CreateCandidateFormValues) => void
 *
 * Example usage
 * -------------
 * <CreateCandidateForm open={open} onOpenChange={setOpen}
 *   onSubmit={(values) => addCandidate(buildCandidateFromForm(values))} />
 *
 * Accessibility
 * -------------
 * Every field has a real <Label htmlFor>; validation errors are
 * rendered adjacent to their field.
 *
 * Future extension
 * -----------------
 * Add a small embedded map picker for latitude/longitude instead of
 * raw number inputs, once a reusable "pick a point" map mode exists.
 */
export interface CreateCandidateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateCandidateFormValues) => void
}

export function CreateCandidateForm({ open, onOpenChange, onSubmit }: CreateCandidateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCandidateFormValues>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      name: '',
      neighbourhood: '',
      address: '',
      provider: PROVIDERS[0],
      latitude: (MAP_CONFIG.defaultCenter as [number, number])[0],
      longitude: (MAP_CONFIG.defaultCenter as [number, number])[1],
    },
  })

  const submit = handleSubmit((values) => {
    onSubmit(values)
    reset()
    onOpenChange(false)
  })

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
      title="Create candidate node"
      description="Add a new proposed PUDO location"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSubmitting}>
            Create candidate
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-candidate-name" required>
            Name
          </Label>
          <Input
            id="create-candidate-name"
            placeholder="e.g. Labone Junction Hub"
            error={!!errors.name}
            {...register('name')}
          />
          {errors.name && <p className="text-caption text-error-600">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-candidate-neighbourhood" required>
            Neighbourhood
          </Label>
          <Input
            id="create-candidate-neighbourhood"
            placeholder="e.g. Labone"
            error={!!errors.neighbourhood}
            {...register('neighbourhood')}
          />
          {errors.neighbourhood && (
            <p className="text-caption text-error-600">{errors.neighbourhood.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-candidate-address" required>
            Address
          </Label>
          <Input id="create-candidate-address" error={!!errors.address} {...register('address')} />
          {errors.address && (
            <p className="text-caption text-error-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-candidate-lat" required>
              Latitude
            </Label>
            <Input
              id="create-candidate-lat"
              type="number"
              step="0.0001"
              error={!!errors.latitude}
              {...register('latitude', { valueAsNumber: true })}
            />
            {errors.latitude && (
              <p className="text-caption text-error-600">{errors.latitude.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-candidate-lng" required>
              Longitude
            </Label>
            <Input
              id="create-candidate-lng"
              type="number"
              step="0.0001"
              error={!!errors.longitude}
              {...register('longitude', { valueAsNumber: true })}
            />
            {errors.longitude && (
              <p className="text-caption text-error-600">{errors.longitude.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-candidate-provider" required>
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
      </form>
    </Modal>
  )
}
