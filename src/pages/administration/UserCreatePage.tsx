import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '@/api/roles.api'
import { usersApi } from '@/api/users.api'
import { Card, CardContent } from '@/components/ui/card'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { RoleLookupResponse, UserFormValues } from '@/features/users/types'
import { emptyUserFormValues, validateUserForm } from '@/features/users/validation'

export function UserCreatePage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const [values, setValues] = useState<UserFormValues>(emptyUserFormValues)
  const [errors, setErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState<RoleLookupResponse[]>([])

  useEffect(() => {
    void rolesApi.listOptions().then(setRoles).catch(() => setRoles([]))
  }, [])

  async function handleSubmit() {
    const nextErrors = validateUserForm(values, 'create')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setFormError(null)
    try {
      await usersApi.create(values)
      navigate('/admin/users')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-lg font-semibold">Create User</div>
          <div className="text-sm text-slate-500">Buat user baru dari route /admin/users/create</div>
        </CardContent>
      </Card>
      <UserFormDialog
        open={open}
        mode="create"
        values={values}
        errors={errors}
        formError={formError}
        isDetailLoading={false}
        submitting={submitting}
        availableRoles={roles}
        onValuesChange={setValues}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) navigate('/admin/users')
        }}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  )
}
