'use client'

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { verifyEmailMutationFn } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ConfirmAccount() {
    const params = useSearchParams();
    const code = params.get("code")
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationFn: verifyEmailMutationFn
    })

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        if (!code) {
            toast.error("Confirmation token not found")
            return;
        }

        mutate({ code }, {
            onSuccess: () => {
                toast.success("Account confirmed successfully")
                router.replace("/")
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <main className="w-full min-h-[590px] h-full max-w-full flex items-center justify-center ">
            <div className="w-full h-full p-5 rounded-md">
                <div className="flex flex-col items-center">
                    <Logo />

                    <h1
                        className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-4 mt-8
        text-center sm:text-left"
                    >
                        Account confirmation
                    </h1>
                    <p className="mb-6 text-center sm:text-left text-[15px] dark:text-[#f1f7feb5] font-normal">
                        To confirm your account, please follow the button below.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Button className="w-full text-[15px] h-[40px] text-white font-semibold" disabled={isPending} type="submit">
                        {isPending && <Loader2 className="animate-spin" />}
                        Confirm account
                    </Button>
                </form>

                <p className="mt-6 text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal">
                    If you have any issue confirming your account please, contact{" "}
                    <a
                        className="outline-none transition duration-150 ease-in-out 
            focus-visible:ring-2 text-primary hover:underline focus-visible:ring-primary"
                        href="#"
                    >
                        3551akshay@gmail.com
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}