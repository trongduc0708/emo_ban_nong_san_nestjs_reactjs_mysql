export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">
          Emo Nông Sản - Backend API
        </h1>
      </div>
      
      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 border rounded">
              <h3 className="font-bold">Authentication</h3>
              <p>POST /api/auth/register</p>
              <p>POST /api/auth/login</p>
              <p>POST /api/auth/forgot-password</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-bold">Products</h3>
              <p>GET /api/products</p>
              <p>GET /api/products/[id]</p>
              <p>POST /api/products (Admin)</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-bold">Orders</h3>
              <p>GET /api/orders</p>
              <p>POST /api/orders</p>
              <p>PUT /api/orders/[id]</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-bold">Payment</h3>
              <p>POST /api/payment/vnpay</p>
              <p>GET /api/payment/vnpay-return</p>
              <p>POST /api/payment/vnpay-ipn</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
