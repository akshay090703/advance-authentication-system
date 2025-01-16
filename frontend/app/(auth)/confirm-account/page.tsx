import { SkeletonCard } from '@/components/Fallback'
import React, { Suspense } from 'react'
import ConfirmAccount from './_confirm-account'

const ConfirmAccountPage = () => {
    return (
        <Suspense fallback={<SkeletonCard />}>
            <ConfirmAccount />
        </Suspense>
    )
}

export default ConfirmAccountPage