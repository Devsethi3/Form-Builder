import { SignIn } from '@clerk/nextjs'
import React from 'react'
import Image from 'next/image'

const SignInPage = () => {
    return (
        <>
            <section className="">
                <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
                    <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
                        <Image
                            alt="Sign in background"
                            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                            fill
                            className="object-cover"
                            priority
                        />
                    </aside>

                    <main
                        className="flex items-center justify-center flex-col px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
                    >
                        <div className="max-w-xl lg:max-w-3xl">
                            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                                Welcome Back!
                            </h1>

                            <p className="mb-4 text-sm text-center leading-relaxed text-gray-500">
                                Log in to QuickForm and pick up where you left off
                            </p>
                        </div>
                        <SignIn />
                    </main>
                </div>
            </section>
        </>
    )
}

export default SignInPage
