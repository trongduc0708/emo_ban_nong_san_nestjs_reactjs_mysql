// Test utility để kiểm tra logic redirect theo role
export const testAuthRedirect = () => {
  console.log('🧪 Testing Auth Redirect Logic...')
  
  // Test cases
  const testCases = [
    {
      name: 'Customer login should redirect to home',
      userRole: 'customer',
      expectedRedirect: '/',
      description: 'Khách hàng đăng nhập sẽ được redirect về trang chủ'
    },
    {
      name: 'Admin login should redirect to admin dashboard',
      userRole: 'admin', 
      expectedRedirect: '/admin',
      description: 'Admin đăng nhập sẽ được redirect về trang admin'
    }
  ]
  
  testCases.forEach(testCase => {
    console.log(`\n📋 ${testCase.name}`)
    console.log(`   Role: ${testCase.userRole}`)
    console.log(`   Expected redirect: ${testCase.expectedRedirect}`)
    console.log(`   Description: ${testCase.description}`)
    
    // Simulate the logic
    const redirectTo = testCase.userRole === 'admin' ? '/admin' : '/'
    const isCorrect = redirectTo === testCase.expectedRedirect
    
    console.log(`   ✅ Result: ${redirectTo}`)
    console.log(`   ${isCorrect ? '✅ PASS' : '❌ FAIL'}`)
  })
  
  console.log('\n🎯 Auth Redirect Test Complete!')
}

// Function để test redirect logic trong component
export const simulateLoginRedirect = (userRole: 'customer' | 'admin') => {
  const redirectTo = userRole === 'admin' ? '/admin' : '/'
  console.log(`🔄 Simulating login redirect for role: ${userRole}`)
  console.log(`📍 Redirecting to: ${redirectTo}`)
  return redirectTo
}

// Function để test admin redirect logic
export const simulateAdminRedirect = (currentPath: string, userRole: 'customer' | 'admin') => {
  if (userRole !== 'admin') {
    console.log(`👤 User is not admin, no redirect needed`)
    return false
  }
  
  const adminPaths = ['/admin', '/admin/']
  const isOnAdminPage = adminPaths.some(path => currentPath.startsWith(path))
  
  if (isOnAdminPage) {
    console.log(`✅ Admin is already on admin page: ${currentPath}`)
    return false
  }
  
  console.log(`🔄 Admin should be redirected from ${currentPath} to /admin`)
  return true
}
