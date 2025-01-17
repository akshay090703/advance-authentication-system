import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { logoutMutationFn } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react'
import { toast } from 'sonner';

const LogoutDialog = (props: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { isOpen, setIsOpen } = props
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationFn: logoutMutationFn,
        onSuccess: () => {
            router.replace("/")
            setIsOpen(false)
            toast.success("User successfully logged out")
        },
        onError: (error: any) => {
            // console.log(error)
            toast.error(error.message)
        }
    })

    const handleLogout = useCallback(() => {
        mutate();
    }, [])

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure, you want to logout?</DialogTitle>
                        <DialogDescription>
                            This will end your current session and you will need to login again to access your account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant={'destructive'} disabled={isPending} type='button' onClick={handleLogout}>
                            {isPending && <Loader2 className='animate-spin' />}
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default LogoutDialog