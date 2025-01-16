"use client"

import { Button } from '@/components/ui/button'
import { revokeMFAMutationFn } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React, { useCallback } from 'react'
import { toast } from 'sonner'

const RevokeMfa = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: revokeMFAMutationFn,
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({
                queryKey: ["authUser"]
            })
            toast.success("MFA successfully revoked")
        },
        onError: (error: any) => {
            toast.error(error.message)
        }
    });

    const handleClick = useCallback(() => {
        mutate();
    }, [])

    return (
        <Button className="h-[35px] !text-[#c40006d3] hover:bg-red-200 !bg-red-100 shadow-none mr-1" disabled={isPending} onClick={handleClick}>
            {isPending && <Loader2 className='animate-spin' />}
            Revoke Access
        </Button>
    )
}

export default RevokeMfa