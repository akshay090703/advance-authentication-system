import React, { Suspense } from 'react'
import ForgotPassword from './_forgotpassword'
import { SkeletonCard } from '@/components/Fallback'

const ForgotPasswordPage = () => {
    return (
        <Suspense fallback={<SkeletonCard />}>
            <ForgotPassword />
        </Suspense>
    )
}

export default ForgotPasswordPage