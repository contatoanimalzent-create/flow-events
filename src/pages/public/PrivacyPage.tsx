export function PrivacyPage() {
  return (
    <div style={{ background:'#080808',color:'#f5f5f0',minHeight:'100vh',padding:'60px 48px' }}>
      <div style={{ maxWidth:800,margin:'0 auto' }}>
        <h1 style={{ fontSize:32,fontWeight:700,marginBottom:24,color:'#d4ff00' }}>Privacy Policy</h1>
        
        <div style={{ fontSize:14,lineHeight:1.8,color:'#9a9a9a' }}>
          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, create an event, or contact us for support. This includes:</p>
            <ul style={{ marginLeft:20,marginTop:12,listStyle:'disc' }}>
              <li>Name and email address</li>
              <li>Event details and descriptions</li>
              <li>Payment information</li>
              <li>Communications and support requests</li>
            </ul>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul style={{ marginLeft:20,marginTop:12,listStyle:'disc' }}>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send notifications</li>
              <li>Respond to your requests and inquiries</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>4. Third-Party Services</h2>
            <p>We may use third-party service providers (such as payment processors and analytics providers) to support our operations. These service providers are bound by confidentiality agreements and are only permitted to use your information as necessary to provide services to us.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>5. Cookies</h2>
            <p>Our website uses cookies to enhance your experience. You can control cookie settings through your browser preferences at any time.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at support@animalz.events.</p>
          </section>

          <section>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any significant changes by posting the updated policy on our website.</p>
          </section>
        </div>

        <div style={{ marginTop:48,paddingTop:24,borderTop:'1px solid #1a1a1a' }}>
          <a href="/" style={{ color:'#d4ff00',textDecoration:'none',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em' }}>← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
