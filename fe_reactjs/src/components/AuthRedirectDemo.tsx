import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { testAuthRedirect, simulateLoginRedirect, simulateAdminRedirect } from '@/utils/authRedirectTest'

export default function AuthRedirectDemo() {
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []
    
    // Test login redirects
    results.push('🧪 Testing Login Redirects:')
    results.push(`Customer login → ${simulateLoginRedirect('customer')}`)
    results.push(`Admin login → ${simulateLoginRedirect('admin')}`)
    
    // Test admin redirects
    results.push('\n🧪 Testing Admin Redirects:')
    results.push(`Admin on / → ${simulateAdminRedirect('/', 'admin') ? 'Redirect to /admin' : 'Stay'}`)
    results.push(`Admin on /products → ${simulateAdminRedirect('/products', 'admin') ? 'Redirect to /admin' : 'Stay'}`)
    results.push(`Admin on /admin → ${simulateAdminRedirect('/admin', 'admin') ? 'Redirect to /admin' : 'Stay'}`)
    results.push(`Customer on / → ${simulateAdminRedirect('/', 'customer') ? 'Redirect to /admin' : 'Stay'}`)
    
    setTestResults(results)
  }

  const runConsoleTests = () => {
    testAuthRedirect()
    setTestResults(prev => [...prev, '\n📊 Check console for detailed test results'])
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🧪 Auth Redirect Test Demo
      </h2>
      
      <p className="text-gray-600 mb-6">
        Test chức năng redirect theo role khi đăng nhập
      </p>
      
      <div className="space-y-4">
        <Button onClick={runTests} className="w-full">
          🚀 Run Redirect Tests
        </Button>
        
        <Button onClick={runConsoleTests} variant="outline" className="w-full">
          📊 Run Console Tests
        </Button>
        
        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Test Results:
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {testResults.join('\n')}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Test Cases:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Customer đăng nhập → Redirect về trang chủ (/)</li>
          <li>• Admin đăng nhập → Redirect về admin dashboard (/admin)</li>
          <li>• Admin truy cập trang khách hàng → Auto redirect về /admin</li>
          <li>• Customer truy cập trang admin → Redirect về trang chủ</li>
        </ul>
      </div>
    </Card>
  )
}
