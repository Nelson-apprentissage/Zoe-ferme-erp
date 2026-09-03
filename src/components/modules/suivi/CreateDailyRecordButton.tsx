'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DailyRecordModal } from './DailyRecordModal'
import type { FeedProduct } from '@/types'

export function CreateDailyRecordButton({
  batchId,
  feedProducts,
}: {
  batchId: string
  feedProducts: FeedProduct[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="create-daily-record-btn">
        <Plus size={16} />
        Saisie du jour
      </button>
      {open && (
        <DailyRecordModal
          batchId={batchId}
          feedProducts={feedProducts}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
