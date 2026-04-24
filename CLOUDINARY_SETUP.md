# Cloudinary Setup Guide

## Configuração do Cloudinary para Capital Strike Event

### 1. Criar Conta Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. Vá para o Dashboard

### 2. Obter Credenciais

No Dashboard do Cloudinary, você encontrará:
- **Cloud Name**: identificador único da sua conta
- **API Key**: chave de API
- **API Secret**: segredo da API (nunca compartilhe)

### 3. Configurar Upload Preset

1. Vá para **Settings** → **Upload**
2. Em "Upload presets", clique em "Add upload preset"
3. Configure:
   - **Preset Name**: `flow-events-unsigned` (ou seu nome preferido)
   - **Signing Mode**: Unsigned (permite upload do frontend)
   - **Folder**: `flow-events/capital-strike`
   - Salve

### 4. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=flow-events-unsigned
```

### 5. Usando o Hook `useCloudinaryUpload`

```tsx
import { useCloudinaryUpload } from '@/shared/hooks'

function MyComponent() {
  const { upload, loading, error } = useCloudinaryUpload({
    maxSize: 10, // 10MB
    folder: 'capital-strike'
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = await upload(file)
      if (url) {
        console.log('Uploaded:', url)
      }
    }
  }

  return (
    <>
      <input type="file" onChange={handleFileSelect} />
      {loading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </>
  )
}
```

### 6. Usando o Componente `CloudinaryUpload`

```tsx
import { CloudinaryUpload } from '@/shared/components'

function MyComponent() {
  const handleUploadSuccess = (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl)
    // Use a URL da imagem
  }

  return (
    <CloudinaryUpload
      onUpload={handleUploadSuccess}
      label="Upload Hero Image"
    />
  )
}
```

### 7. Limpar Recursos

As imagens uploaded para Cloudinary podem ser gerenciadas via:
- **Media Library**: visualize todas as imagens
- **Transformations**: aplique filtros, redimensionamento, etc.

## Transformações Úteis

Adicione transformações à URL da imagem:

```
# Redimensionar para 1920x1080
https://res.cloudinary.com/{cloud}/image/upload/w_1920,h_1080,c_fill/{public_id}

# Otimizar automaticamente
https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/{public_id}

# Blur para fallback
https://res.cloudinary.com/{cloud}/image/upload/e_blur:300/{public_id}
```

## Segurança

- ✅ Use upload presets **Unsigned** apenas para dados públicos
- ✅ Nunca compartilhe API Secret
- ✅ Configure regras de válidação no upload preset
- ❌ Não armazene credenciais sensíveis no frontend

## Referências

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [JavaScript SDK](https://cloudinary.com/documentation/cloudinary_js_library)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
