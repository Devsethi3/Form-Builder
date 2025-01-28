import { SignUp } from '@clerk/nextjs'
import React from 'react'
import Image from 'next/image'

const SignUpPage = () => {
    return (
        <div>
            <section className="">
                <div className="lg:grid h-screen lg:grid-cols-12">
                    <aside className="relative block lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
                        <Image
                            alt="Sign up background"
                            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                            fill
                            className="object-cover"
                            priority
                        />
                    </aside>

                    <main
                        className="flex flex-col items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
                    >
                        <div className="max-w-xl lg:max-w-3xl">
                            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                                Create an account!
                            </h1>

                            <p className="mb-4 text-sm mx-4 text-center leading-relaxed text-gray-500">
                                Join QuickForm It&apos;s quick, it&apos;s easy, and best of all, it&apos;s free! 🎉
                            </p>
                        </div>
                        <SignUp />
                    </main>
                </div>
            </section>
        </div>
    )
}

export default SignUpPage
