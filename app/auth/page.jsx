'use client'

import React from 'react'
import AuthForm from '@/components/AuthForm'

const page = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-4xl font-bold'>Not Authenticated</h1>
        <AuthForm />
    </div>
  )
}

export default page