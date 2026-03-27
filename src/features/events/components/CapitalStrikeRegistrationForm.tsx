import { useState } from 'react'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { validateCPF, formatCPF, unformatCPF } from '@/lib/validators/cpf'
import { validatePhone, formatPhoneBR, unformatPhone } from '@/lib/validators/phone'
import { validateEmail } from '@/lib/validators/email'
import { createClient } from '@supabase/supabase-js'

interface FormData {
  fullName: string
  cpf: string
  email: string
  phone: string
  motherName: string
  address: string
  squad?: string
}

interface FormErrors {
  fullName?: string
  cpf?: string
  email?: string
  phone?: string
  motherName?: string
  address?: string
}

interface CapitalStrikeRegistrationFormProps {
  army: 'coalizao' | 'alianca'
  onBack: () => void
}

export function CapitalStrikeRegistrationForm({ army, onBack }: CapitalStrikeRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    motherName: '',
    address: '',
    squad: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const armyColor = army === 'coalizao' ? '#FFC107' : '#2196F3'
  const armyLabel = army === 'coalizao' ? 'COALIZÃO' : 'ALIANÇA'

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full name: require at least 2 words
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome obrigatório'
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Informe nome completo (mínimo 2 palavras)'
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = 'Nome não pode conter números'
    }

    // CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone obrigatório'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido'
    }

    // Mother name
    if (!formData.motherName.trim()) {
      newErrors.motherName = 'Nome da mãe obrigatório'
    } else if (formData.motherName.trim().split(' ').length < 2) {
      newErrors.motherName = 'Informe nome completo da mãe'
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length === 11) {
      value = formatCPF(value)
    } else if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`
    } else if (value.length > 6 && value.length <= 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    } else if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`
    }

    setFormData((prev) => ({ ...prev, cpf: value }))
    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: undefined }))
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`
      } else if (value.length <= 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`
      } else if (value.length <= 10) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
      }
    }

    setFormData((prev) => ({ ...prev, phone: value }))
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )

      const { error } = await supabase.from('capital_strike_registrations').insert([
        {
          full_name: formData.fullName,
          cpf: unformatCPF(formData.cpf),
          email: formData.email,
          phone: unformatPhone(formData.phone),
          mother_name: formData.motherName,
          address: formData.address,
          squad: formData.squad || null,
          army,
        },
      ])

      if (error) {
        console.error('Registration error:', error)
        setErrors({ fullName: 'Erro ao registrar. Tente novamente.' })
        return
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ fullName: 'Erro inesperado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="min-h-screen bg-[#0a0908] px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-[2rem] border border-[#4a9b7f]/20 bg-[#4a9b7f]/10 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4a9b7f]/20 mx-auto">
              <Check className="h-8 w-8 text-[#4a9b7f]" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-semibold text-[#f0ebe2]">
              Inscrição confirmada!
            </h2>

            <p className="mt-4 text-base text-[#9a9088]">
              Você foi registrado como operador da <span className="font-semibold" style={{ color: armyColor }}>
                {armyLabel}
              </span>.
            </p>

            <p className="mt-3 text-sm text-[#6a6058]">
              Confira seu e-mail para instruções de pré-operação e documentos necessários.
            </p>

            <button
              onClick={onBack}
              className="mt-8 w-full rounded-full bg-[#c49a50] py-3 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5"
            >
              Voltar para home
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#0a0908] px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#9a9088] transition-colors hover:text-[#f0ebe2]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[#0f0e0d] p-8 md:p-12">
          <h1 className="font-display text-3xl font-semibold text-[#f0ebe2]">
            Inscrição
          </h1>

          <p className="mt-2 text-base text-[#9a9088]">
            Operador da <span style={{ color: armyColor }} className="font-semibold">
              {armyLabel}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                Nome completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }))
                  }
                }}
                placeholder="Seu nome completo"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.fullName}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 font-mono text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.cpf && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.cpf}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                E-mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                placeholder="seu@email.com"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 font-mono text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.phone}</p>
              )}
            </div>

            {/* Mother Name */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                Nome da mãe *
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, motherName: e.target.value }))
                  if (errors.motherName) {
                    setErrors((prev) => ({ ...prev, motherName: undefined }))
                  }
                }}
                placeholder="Nome completo da mãe"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.motherName && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.motherName}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                Endereço *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                  if (errors.address) {
                    setErrors((prev) => ({ ...prev, address: undefined }))
                  }
                }}
                placeholder="Rua, número, complemento, cidade, estado, CEP"
                rows={3}
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-[#c45c6a]">{errors.address}</p>
              )}
            </div>

            {/* Squad (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[#f0ebe2]">
                Esquadrão (opcional)
              </label>
              <input
                type="text"
                value={formData.squad}
                onChange={(e) => setFormData((prev) => ({ ...prev, squad: e.target.value }))}
                placeholder="Nome do seu esquadrão"
                className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#f0ebe2] placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c49a50]/40"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: armyColor }}
              className="mt-8 w-full rounded-lg py-3.5 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              ) : null}
              {loading ? 'Processando...' : 'Confirmar Inscrição'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6a6058]">
            Ao se inscrever, você concorda com nossos termos e condições.
          </p>
        </div>
      </div>
    </section>
  )
}
