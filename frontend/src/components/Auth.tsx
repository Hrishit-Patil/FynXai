import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [debugInfo, setDebugInfo] = useState<string>('')

  const testConnection = async () => {
    setStatus('Testing connection...')
    setDebugInfo('')

    try {
      // 1. Simple Read Test (Does the URL work?)
      // We try to fetch the session. This requires no table permissions.
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('❌ Connection Failed')
        setDebugInfo(`Error Name: ${error.name}\nMessage: ${error.message}`)
        console.error("Supabase Error:", error)
      } else {
        setStatus('✅ Connection Successful')
        setDebugInfo(`Connected to Project!\nSession: ${data.session ? 'Active' : 'No Active Session (This is normal)'}`)
        
        // 2. Attempt a fake signup to force a backend response
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'test_connection@example.com',
          password: 'password123',
        })
        
        if (signUpError) {
          setDebugInfo(prev => prev + `\n\nSignup Test Error: ${signUpError.message}`)
        } else {
          setDebugInfo(prev => prev + `\n\nSignup Test: Request Sent Successfully (Check Supabase Dashboard!)`)
        }
      }
    } catch (err: any) {
      setStatus('❌ Critical Crash')
      setDebugInfo(err.message || JSON.stringify(err))
    }
  }

  return (
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Debugger</h1>
      
      <button 
        onClick={testConnection}
        className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700"
      >
        TEST CONNECTION
      </button>

      <div className="mt-8 p-4 bg-gray-100 rounded w-full max-w-2xl min-h-[200px] whitespace-pre-wrap font-mono border border-gray-300">
        <p className="font-bold text-lg mb-2">{status}</p>
        <hr className="border-gray-300 mb-2"/>
        <p className="text-sm text-gray-700">{debugInfo}</p>
      </div>
    </div>
  )
}