import { SkeletonCard } from '@/components/Fallback'
import React, { Suspense } from 'react'
import ResetPassword from './_resetpassword'

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<SkeletonCard />}>
            <ResetPassword />
        </Suspense>
    )
}

export default ResetPasswordPage