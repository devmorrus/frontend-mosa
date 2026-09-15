import { useEffect, useState } from 'react'
import { goodsReceivingsApi } from '@/api/goodsReceivings.api'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/types/api'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { GoodsReceivingDetail, GoodsReceivingFormValues } from '@/features/goods-receivings/types'
import {
  ensureAtLeastOneItem,
  mapReceivingDetailToFormValues,
  normalizeGoodsReceivingErrors,
} from '@/features/goods-receivings/utils'
import {
  createEmptyReceivingItem,
  emptyGoodsReceivingFormValues,
  validateGoodsReceivingForm,
} from '@/features/goods-receivings/validation'

export function useGoodsReceivingForm(receivingId?: string) {
  const pushToast = useUiStore((state) => state.pushToast)
  const [detail, setDetail] = useState<GoodsReceivingDetail | null>(null)
  const [formValues, setFormValues] = useState<GoodsReceivingFormValues>(emptyGoodsReceivingFormValues)
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [postError, setPostError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(receivingId))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [showPostConfirmation, setShowPostConfirmation] = useState(false)
  const isEditMode = Boolean(receivingId)
  const isReadOnly = detail ? detail.status !== 'DRAFT' : false

  function syncDetail(nextDetail: GoodsReceivingDetail) {
    setDetail(nextDetail)
    setFormValues(ensureAtLeastOneItem(mapReceivingDetailToFormValues(nextDetail)))
  }

  useEffect(() => {
    if (!receivingId) {
      return
    }

    const resolvedReceivingId = receivingId

    async function loadDetail() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const nextDetail = await goodsReceivingsApi.getById(resolvedReceivingId)
        syncDetail(nextDetail)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setLoadError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadDetail()
  }, [receivingId])

  function updateHeader<K extends keyof GoodsReceivingFormValues>(
    field: K,
    value: GoodsReceivingFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function updateItem(index: number, updater: (current: GoodsReceivingFormValues['items'][number]) => GoodsReceivingFormValues['items'][number]) {
    setFormValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)),
    }))
  }

  function addItem() {
    setFormValues((current) => ({
      ...current,
      items: [...current.items, createEmptyReceivingItem()],
    }))
  }

  function removeItem(index: number) {
    setFormValues((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function reload() {
    if (!receivingId) return

    const resolvedReceivingId = receivingId

    setIsLoading(true)
    setLoadError(null)

    try {
      const nextDetail = await goodsReceivingsApi.getById(resolvedReceivingId)
      syncDetail(nextDetail)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setLoadError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function submit() {
    if (isSubmitting || isPosting) {
      return null
    }

    const nextErrors = validateGoodsReceivingForm(formValues)
    setFormErrors(nextErrors)
    setFormError(null)
    setPostError(null)

    if (Object.keys(nextErrors).length > 0) {
      return null
    }

    setIsSubmitting(true)

    try {
      const result = receivingId
        ? await goodsReceivingsApi.update(receivingId, formValues)
        : await goodsReceivingsApi.create(formValues)

      syncDetail(result)
      setFormErrors({})
      pushToast('success', receivingId ? 'Draft receiving berhasil diperbarui.' : 'Draft receiving berhasil dibuat.')
      return result
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      const nextFormErrors = apiError.errors ? normalizeGoodsReceivingErrors(apiError.errors) : {}
      setFormErrors(nextFormErrors)
      setFormError(apiError.errors ? null : apiError.message)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  function openPostConfirmation() {
    setPostError(null)

    if (!receivingId || !detail) {
      setPostError('Draft receiving belum tersedia untuk dipost.')
      return
    }

    if (detail.status !== 'DRAFT') {
      setPostError('Hanya receiving dengan status DRAFT yang dapat dipost.')
      return
    }

    if (isPosting || isSubmitting) {
      return
    }

    setShowPostConfirmation(true)
  }

  function closePostConfirmation(open: boolean) {
    if (isPosting) return
    setShowPostConfirmation(open)
  }

  async function submitPost() {
    if (!receivingId || !detail) {
      setPostError('Draft receiving belum tersedia untuk dipost.')
      setShowPostConfirmation(false)
      return null
    }

    if (detail.status !== 'DRAFT') {
      setPostError('Receiving ini sudah tidak berada pada status DRAFT.')
      setShowPostConfirmation(false)
      return null
    }

    if (isPosting) {
      return null
    }

    setIsPosting(true)
    setPostError(null)

    try {
      const result = await goodsReceivingsApi.post(receivingId)
      syncDetail(result)
      setFormErrors({})
      setFormError(null)
      setShowPostConfirmation(false)
      pushToast('success', 'Receiving berhasil dipost.')
      return result
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setPostError(apiError.message || 'Receiving gagal dipost. Tidak ada perubahan stock yang disimpan.')
      setShowPostConfirmation(false)
      return null
    } finally {
      setIsPosting(false)
    }
  }

  return {
    detail,
    formValues,
    setFormValues,
    formErrors,
    formError,
    postError,
    loadError,
    isLoading,
    isSubmitting,
    isPosting,
    isEditMode,
    isReadOnly,
    showPostConfirmation,
    updateHeader,
    updateItem,
    addItem,
    removeItem,
    openPostConfirmation,
    closePostConfirmation,
    reload,
    submit,
    submitPost,
  }
}
