export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <h1>🇬🇷 Greeka Todo API Server</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>✅ API Status</h2>
        <p>Your Next.js API server is running successfully!</p>
        <p>Check the health endpoint: <a href="/api/health" target="_blank">/api/health</a></p>
      </div>

      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>🔧 Setup Instructions</h2>
        <ol>
          <li>Install dependencies: <code>npm install</code></li>
          <li>Set up PostgreSQL database</li>
          <li>Create <code>.env</code> with database credentials</li>
          <li>Initialize database: <code>node lib/init-db.js</code></li>
          <li>Start development server: <code>npm run dev</code></li>
        </ol>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
      <h2>📋 Available Endpoints</h2>
        <ul>
          <li><strong>GET /api/health</strong> - Health check</li>
          <li><strong>GET /docs</strong> - Swagger UI</li>
          <li><strong>GET /api/tasks</strong> - List tasks with pagination & filtering</li>
          <li><strong>POST /api/tasks</strong> - Create new task</li>
          <li><strong>GET /api/tasks/[id]</strong> - Get single task</li>
          <li><strong>PUT /api/tasks/[id]</strong> - Update task</li>
          <li><strong>DELETE /api/tasks/[id]</strong> - Delete task</li>
          <li><strong>GET /api/tasks/export</strong> - Export tasks (CSV/JSON)</li>
        </ul>
      </div>
    </div>
  )
} 