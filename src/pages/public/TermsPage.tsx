export function TermsPage() {
  return (
    <div style={{ background:'#080808',color:'#f5f5f0',minHeight:'100vh',padding:'60px 48px' }}>
      <div style={{ maxWidth:800,margin:'0 auto' }}>
        <h1 style={{ fontSize:32,fontWeight:700,marginBottom:24,color:'#d4ff00' }}>Terms & Conditions</h1>
        
        <div style={{ fontSize:14,lineHeight:1.8,color:'#9a9a9a' }}>
          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>1. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Animalz Events' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul style={{ marginLeft:20,marginTop:12,listStyle:'disc' }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>2. Disclaimer</h2>
            <p>The materials on Animalz Events' website are provided on an 'as is' basis. Animalz Events makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>3. Limitations</h2>
            <p>In no event shall Animalz Events or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Animalz Events' website.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>4. Accuracy of Materials</h2>
            <p>The materials appearing on Animalz Events' website could include technical, typographical, or photographic errors. Animalz Events does not warrant that any of the materials on its website are accurate, complete, or current. Animalz Events may make changes to the materials contained on its website at any time without notice.</p>
          </section>

          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>5. Links</h2>
            <p>Animalz Events has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Animalz Events of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2 style={{ fontSize:20,fontWeight:600,color:'#f5f5f0',marginBottom:12 }}>6. Modifications</h2>
            <p>Animalz Events may revise these terms and conditions for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms and conditions.</p>
          </section>
        </div>

        <div style={{ marginTop:48,paddingTop:24,borderTop:'1px solid #1a1a1a' }}>
          <a href="/" style={{ color:'#d4ff00',textDecoration:'none',fontSize:12,fontFamily:'DM Mono,monospace',letterSpacing:'0.1em' }}>← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
