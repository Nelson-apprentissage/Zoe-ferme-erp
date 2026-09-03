'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { BatchFormModal } from './BatchFormModal'
import type { Building, Supplier } from '@/types'

interface CreateBatchButtonProps {
  farmId: string
  buildings: Building[]
  suppliers: Supplier[]
}

export function CreateBatchButton({ farmId, buildings, suppliers }: CreateBatchButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary"
        id="create-batch-btn"
      >
        <Plus size={16} />
        Nouveau lot
      </button>
      {open && (
        <BatchFormModal
          farmId={farmId}
          buildings={buildings}
          suppliers={suppliers}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
