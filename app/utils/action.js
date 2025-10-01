'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const signInWith = provider => async () => {
    const supabase = await createClient()
    const auth_callback_url = `${process.env.SITE_URL}/auth/callback`

    const { data, error } = 
    await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url
        },
    })

    console.log(data)

    if (error) {
        console.log(error)
    }

    redirect(data.url)
}

const signInWithGoogle= signInWith('google')

const signOut = async () => {
    const supabase =  await createClient()
    await supabase.auth.signOut()
}

//Signup with Email Password
const signupWithEmailPassword = async (prev, formData) => {
    const supabase = await createClient()

    const { data, error} = await supabase.auth.signUp({
        email: formData.get('email'),
        password: formData.get('password')
    })

    console.log(data)

    if (error) {
        console.log('error', error)
        return {
            success: null,
            error: error.message,
        }
    }

    return {
        success: 'Please check you email',
        error: null,
    }
}

const signinWithEmailPassword = async (prev, formData) => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (error){
        console.log('error',error)
        return {
            success: null,
            error: error.message,
        }
    }

    redirect('/')

}

export { 
    signInWithGoogle, 
    signOut, 
    signupWithEmailPassword, 
    signinWithEmailPassword 
}
