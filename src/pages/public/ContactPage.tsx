import { useState } from 'react'

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this to a backend
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div style={{ background:'#080808',color:'#f5f5f0',minHeight:'100vh',padding:'60px 48px' }}>
      <div style={{ maxWidth:600,margin:'0 auto' }}>
        <h1 style={{ fontSize:32,fontWeight:700,marginBottom:12,color:'#d4ff00' }}>Contact Us</h1>
        <p style={{ color:'#9a9a9a',marginBottom:48,fontSize:14 }}>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

        {submitted ? (
          <div style={{ background:'rgba(212,255,0,0.1)',border:'1px solid rgba(212,255,0,0.3)',borderRadius:4,padding:24,textAlign:'center' }}>
            <h3 style={{ color:'#d4ff00',marginBottom:8 }}>Thank you!</h3>
            <p style={{ color:'#9a9a9a',fontSize:14 }}>We've received your message and will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:20 }}>
            <div>
              <label style={{ display:'block',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em',color:'#d4ff00',marginBottom:8,textTransform:'uppercase' }}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ width:'100%',padding:12,background:'#1a1a1a',border:'1px solid #242424',borderRadius:4,color:'#f5f5f0',fontSize:14,outline:'none',transition:'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor='rgba(212,255,0,0.4)'}
                onBlur={(e) => e.currentTarget.style.borderColor='#242424'}
              />
            </div>

            <div>
              <label style={{ display:'block',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em',color:'#d4ff00',marginBottom:8,textTransform:'uppercase' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ width:'100%',padding:12,background:'#1a1a1a',border:'1px solid #242424',borderRadius:4,color:'#f5f5f0',fontSize:14,outline:'none',transition:'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor='rgba(212,255,0,0.4)'}
                onBlur={(e) => e.currentTarget.style.borderColor='#242424'}
              />
            </div>

            <div>
              <label style={{ display:'block',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em',color:'#d4ff00',marginBottom:8,textTransform:'uppercase' }}>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
                rows={6}
                style={{ width:'100%',padding:12,background:'#1a1a1a',border:'1px solid #242424',borderRadius:4,color:'#f5f5f0',fontSize:14,outline:'none',resize:'vertical',transition:'border-color 0.2s',fontFamily:'inherit' }}
                onFocus={(e) => e.currentTarget.style.borderColor='rgba(212,255,0,0.4)'}
                onBlur={(e) => e.currentTarget.style.borderColor='#242424'}
              />
            </div>

            <button
              type="submit"
              style={{ background:'#d4ff00',color:'#080808',padding:12,borderRadius:4,border:'none',fontWeight:600,fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em',cursor:'pointer',transition:'box-shadow 0.2s,transform 0.1s',textTransform:'uppercase' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow='0 0 40px rgba(212,255,0,0.5)'
                e.currentTarget.style.transform='scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow='none'
                e.currentTarget.style.transform='scale(1)'
              }}
            >
              Send Message
            </button>
          </form>
        )}

        <div style={{ marginTop:48,paddingTop:24,borderTop:'1px solid #1a1a1a' }}>
          <a href="/" style={{ color:'#d4ff00',textDecoration:'none',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em' }}>← Back to Home</a>
        </div>

        <div style={{ marginTop:32,paddingTop:32,borderTop:'1px solid #1a1a1a' }}>
          <h3 style={{ color:'#f5f5f0',marginBottom:16 }}>Other Ways to Reach Us</h3>
          <div style={{ color:'#9a9a9a',fontSize:14,lineHeight:1.8 }}>
            <p>📧 Email: support@animalz.events</p>
            <p>💼 Business: business@animalz.events</p>
            <p>📱 Phone: +55 (11) 9999-9999</p>
          </div>
        </div>
      </div>
    </div>
  )
}
