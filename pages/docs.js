import { useEffect } from 'react'

export default function DocsPage() {
  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        // Load CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css'
        document.head.appendChild(link)

        // Add custom CSS to hide search bar
        const customCSS = document.createElement('style')
        customCSS.textContent = `
          /* Hide the search bar */
          .swagger-ui .topbar .download-url-wrapper,
          .swagger-ui .topbar .search-container,
          .swagger-ui .topbar .search-box {
            display: none !important;
          }
          
          /* Hide the filter input */
          .swagger-ui .filter input {
            display: none !important;
          }
          
          /* Hide the filter container */
          .swagger-ui .filter {
            display: none !important;
          }
        `
        document.head.appendChild(customCSS)

        // Load scripts
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Load scripts in sequence
        await loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js')
        await loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js')

        // Initialize Swagger UI
        if (window.SwaggerUIBundle) {
          window.SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIStandalonePreset
            ],
            plugins: [
              window.SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            tryItOutEnabled: true,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            filter: false,
            showExtensions: false,
            showCommonExtensions: false
          })
        }
      } catch (error) {
        console.error('Error loading Swagger UI:', error)
        document.getElementById('swagger-ui').innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h2>Error loading Swagger UI</h2>
            <p>Please check your internet connection and refresh the page.</p>
            <p>Error: ${error.message}</p>
          </div>
        `
      }
    }

    loadSwaggerUI()
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div id="swagger-ui" style={{ height: '100%' }}></div>
    </div>
  )
} 