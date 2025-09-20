'use client'

import { signInWithGoogle } from '@/app/utils/action'
import React from 'react'

const AuthForm = () => {
  return (
    <div>
        <form>
            <button 
            type='submit'
            className='btn'
            formAction={signInWithGoogle}
            >
                Sign In with Google
            </button>
        </form>
    </div>
  )
}

export default AuthForm