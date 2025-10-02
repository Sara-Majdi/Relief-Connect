'use client'

import { signInWithGoogle, signupWithEmailPassword, signinWithEmailPassword } from '@/app/utils/action'
import Link from 'next/link'
import React, { useActionState } from 'react'

const AuthForm = ({ userType, authType }) => {

  const getFormAction = () => {
    switch (authType) {
      case 'signup' :
        return signupWithEmailPassword

      default:
        return signinWithEmailPassword
      
    }
  }

  const [state, formAction, isPending] = useActionState(getFormAction(), {
    error: '',
    success: '',
  })

  const renderSubmitButtonText = () => {
    switch(authType){
      case 'signup' :
        return 'Sign up'

      default:
      return 'Sign in'
    }
  }

  const { error, success} = state

  return (
    <div>
        <form action={formAction} className='flex flex-col gap-2 w-sm'>
          <label className='input input-bordered border-2 flex items-center gap-2 '>
            <input 
              type="email" 
              className="grow" 
              placeholder="Email" 
              name="email" 
            />
          </label>

          <label className='input input-bordered border-2 flex items-center gap-2'>
            <input 
              type="password" 
              className="grow" 
              placeholder="Password" 
              name="password" 
            />
          </label>

          {/* If signup w email */}
          {authType === 'signup' ? (
            <Link className='link' href='/auth'>
              Already have an account?
            </Link>
          ) : (
            <div className='flex justify-between'>
              <Link className='link' href='/auth?authtype=signup'>
                Sign Up
              </Link>
            </div>
          )}

          <button type='submit' className='btn border-2 cursor-pointer'>
            {renderSubmitButtonText()}
          </button>

          {/* error and success message */}
          {error && (
            <div role='alert' className='alert alert-error'>
                <span>{error}</span>
            </div>
          )}

          {success && (
            <div role='alert' className='alert alert-info'>
                <span>{success}</span>
            </div>
          )}

          <p className='text-center'>OR</p>

            <button type='submit' className='btn border-2 cursor-pointer'
              formAction={signInWithGoogle}
            >
                Sign In with Google
            </button>
        </form>
    </div>
  )
}

export default AuthForm