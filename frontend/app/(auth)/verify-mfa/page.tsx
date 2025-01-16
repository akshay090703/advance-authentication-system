import React, { Suspense } from 'react'
import VerifyMfa from './_verifymfa'
import { SkeletonCard } from '@/components/Fallback'

const VerifyMfaPage = () => {
    return (
        <Suspense fallback={<SkeletonCard />}>
            <VerifyMfa />
        </Suspense>
    )
}

export default VerifyMfaPage