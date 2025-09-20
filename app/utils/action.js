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

export { signInWithGoogle, signOut }
