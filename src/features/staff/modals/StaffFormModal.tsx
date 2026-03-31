import { Loader2 } from 'lucide-react'
import { useStaffForm } from '@/features/staff/hooks'
import { STAFF_PERMISSION_OPTIONS } from '@/features/staff/types'
import {
  FormField,
  FormGrid,
  FormSection,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from '@/shared/components'

interface StaffFormModalProps {
  eventId: string
  organizationId: string
  staffId: string | null
  onClose: () => void
  onSaved: () => void
}

export function StaffFormModal({ eventId, organizationId, staffId, onClose, onSaved }: StaffFormModalProps) {
  const { form, updateField, save, saving, loading, error, gateOptions } = useStaffForm({
    eventId,
    organizationId,
    staffId,
    onSaved,
  })

  const rows = [
    [
      { label: 'Nome', key: 'first_name', placeholder: 'Nome', required: true },
      { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' },
    ],
    [
      { label: 'E-mail', key: 'email', placeholder: 'email@exemplo.com' },
      { label: 'Telefone', key: 'phone', placeholder: '(00) 00000-0000' },
    ],
    [
      { label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' },
      { label: 'Empresa', key: 'company', placeholder: 'Nome da empresa' },
    ],
    [
      { label: 'Funcao', key: 'role_title', placeholder: 'ex: Seguranca' },
      { label: 'Departamento', key: 'department', placeholder: 'ex: Operacoes' },
    ],
    [
      { label: 'Area', key: 'area', placeholder: 'ex: Portaria A' },
      { label: 'Diaria (R$)', key: 'daily_rate', placeholder: '0,00' },
    ],
    [
      { label: 'Turno', key: 'shift_label', placeholder: 'ex: Abertura' },
      { label: 'Dispositivo', key: 'linked_device_id', placeholder: 'Device-01' },
    ],
  ] as const

  return (
    <ModalShell size="2xl">
      <ModalHeader
        eyebrow="Staff"
        title={
          <>
            {staffId ? 'Editar membro' : 'Novo membro'}
            <span className="admin-title-accent">.</span>
          </>
        }
        subtitle="Cadastre em tres blocos: identificacao, alocacao operacional e acesso."
        onClose={onClose}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : (
        <>
          <ModalBody>
            <div className="mb-6 rounded-[24px] border border-bg-border bg-bg-secondary/55 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#ae936f]">Ordem recomendada</div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="text-sm leading-6 text-text-secondary">1. Preencha dados basicos para identificar a pessoa.</div>
                <div className="text-sm leading-6 text-text-secondary">2. Defina funcao, area, turno e portaria de trabalho.</div>
                <div className="text-sm leading-6 text-text-secondary">3. Libere permissoes e observacoes para a operacao.</div>
              </div>
            </div>

            <FormSection title="Dados pessoais">
              <div className="space-y-4">
                {rows.slice(0, 3).map((row, rowIndex) => (
                  <FormGrid key={rowIndex}>
                    {row.map((field) => (
                      <FormField key={field.key} label={field.label} required={field.key === 'first_name'}>
                        <input
                          className="input"
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                        />
                      </FormField>
                    ))}
                  </FormGrid>
                ))}
              </div>
            </FormSection>

            <FormSection title="Operacao e alocacao">
              <div className="space-y-4">
                {rows.slice(3).map((row, rowIndex) => (
                  <FormGrid key={rowIndex}>
                    {row.map((field) => (
                      <FormField key={field.key} label={field.label}>
                        <input
                          className="input"
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                        />
                      </FormField>
                    ))}
                  </FormGrid>
                ))}

                <FormGrid>
                  <FormField label="Inicio do turno">
                    <input
                      type="datetime-local"
                      className="input"
                      value={form.shift_starts_at}
                      onChange={(event) => updateField('shift_starts_at', event.target.value)}
                    />
                  </FormField>
                  <FormField label="Fim do turno">
                    <input
                      type="datetime-local"
                      className="input"
                      value={form.shift_ends_at}
                      onChange={(event) => updateField('shift_ends_at', event.target.value)}
                    />
                  </FormField>
                </FormGrid>

                <FormField label="Portaria vinculada">
                  <select className="input" value={form.gate_id} onChange={(event) => updateField('gate_id', event.target.value)}>
                    <option value="">Sem alocacao fixa</option>
                    {gateOptions.map((gate) => (
                      <option key={gate.id} value={gate.id}>
                        {gate.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Permissoes e notas">
              <FormField label="Permissoes operacionais">
                <div className="grid grid-cols-1 gap-2 rounded-[22px] border border-bg-border bg-bg-secondary/55 p-4">
                  {STAFF_PERMISSION_OPTIONS.map((permission) => {
                    const checked = form.permissions.includes(permission.value)

                    return (
                      <label key={permission.value} className="flex items-center gap-3 rounded-[18px] px-2 py-1.5 text-sm text-text-secondary">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            updateField(
                              'permissions',
                              event.target.checked
                                ? [...form.permissions, permission.value]
                                : form.permissions.filter((item) => item !== permission.value),
                            )
                          }}
                        />
                        {permission.label}
                      </label>
                    )
                  })}
                </div>
              </FormField>

              <FormField label="Observacoes">
                <textarea className="input resize-none" rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
              </FormField>
            </FormSection>

            {error ? <div className="rounded-2xl border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">{error}</div> : null}
          </ModalBody>

          <ModalFooter>
            <button onClick={onClose} className="btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={() => void save()} disabled={saving} className="btn-primary flex min-w-[150px] items-center justify-center gap-2 text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Salvando...' : staffId ? 'Salvar membro' : 'Adicionar membro'}
            </button>
          </ModalFooter>
        </>
      )}
    </ModalShell>
  )
}
