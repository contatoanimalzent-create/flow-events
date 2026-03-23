import { Loader2, X } from 'lucide-react'
import { STAFF_PERMISSION_OPTIONS } from '@/features/staff/types'
import { useStaffForm } from '@/features/staff/hooks'

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
      { label: 'Nome *', key: 'first_name', placeholder: 'Nome' },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-sm border border-bg-border bg-bg-card animate-slide-up">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <h2 className="font-display text-xl leading-none">
            {staffId ? 'EDITAR MEMBRO' : 'NOVO MEMBRO'}
            <span className="text-brand-acid">.</span>
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-3">
                {row.map((field) => (
                  <div key={field.key}>
                    <label className="input-label">{field.label}</label>
                    <input
                      className="input"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Inicio do turno</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.shift_starts_at}
                  onChange={(event) => updateField('shift_starts_at', event.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Fim do turno</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.shift_ends_at}
                  onChange={(event) => updateField('shift_ends_at', event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Portaria vinculada</label>
                <select className="input" value={form.gate_id} onChange={(event) => updateField('gate_id', event.target.value)}>
                  <option value="">Sem alocacao fixa</option>
                  {gateOptions.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Permissoes operacionais</label>
                <div className="grid grid-cols-1 gap-2 rounded-sm border border-bg-border bg-bg-surface/50 p-3">
                  {STAFF_PERMISSION_OPTIONS.map((permission) => {
                    const checked = form.permissions.includes(permission.value)

                    return (
                      <label key={permission.value} className="flex items-center gap-2 text-xs text-text-secondary">
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
              </div>
            </div>

            <div>
              <label className="input-label">Observacoes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
            </div>

            {error && <div className="rounded-sm border border-status-error/20 bg-status-error/8 px-3 py-2.5 text-xs text-status-error">{error}</div>}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-bg-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button onClick={() => void save()} disabled={saving} className="btn-primary min-w-[140px] justify-center text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : staffId ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
