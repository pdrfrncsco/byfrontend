import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
} from '@/components/ui'
import { AlertCircle, Loader2, Upload, FileText } from 'lucide-react'
import { z } from 'zod'
import {
  medicalDocumentUploadSchema,
  type MedicalDocumentUpload,
} from '../../schemas/medical.schema'
import { getMedicalDocumentTypeLabel } from '../../hooks/usePlayerMedical'

interface PlayerMedicalDocumentFormProps {
  playerId: string
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function PlayerMedicalDocumentForm({
  playerId,
  onSubmit,
  isLoading = false,
  onCancel,
}: PlayerMedicalDocumentFormProps) {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileSizeError, setFileSizeError] = useState<string | null>(null)

  const baseMedicalDocumentUploadSchema = z.object({
    document_type: z.enum([
      'medical_certificate',
      'injury_report',
      'scan_result',
      'lab_result',
      'vaccination_record',
      'surgery_report',
      'physical_exam',
      'cardiac_screening',
      'other',
    ]),
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(255, 'Título não pode exceder 255 caracteres'),
    description: z.string().max(1000, 'Descrição não pode exceder 1000 caracteres').optional().nullable(),
    issued_at: z.string().datetime(),
    expires_at: z.string().datetime().optional().nullable(),
    is_confidential: z.boolean().default(true),
  })
  const form = useForm<Omit<MedicalDocumentUpload, 'file'>>({
    resolver: zodResolver(baseMedicalDocumentUploadSchema),
    defaultValues: {
      document_type: 'medical_certificate',
      title: '',
      description: '',
      is_confidential: true,
    },
  })

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]

      if (!file) {
        setSelectedFile(null)
        setFileSizeError(null)
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileSizeError('Ficheiro não pode exceder 10MB')
        setSelectedFile(null)
        return
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]

      if (!validTypes.includes(file.type)) {
        setFileSizeError('Tipo de ficheiro não suportado (PDF, JPG, PNG, WEBP, DOC, DOCX)')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setFileSizeError(null)
    },
    []
  )

  const handleSubmit = async (data: Omit<MedicalDocumentUpload, 'file'>) => {
    if (!selectedFile) {
      setFileSizeError('Ficheiro é obrigatório')
      return
    }

    try {
      const formData = new FormData()
      formData.append('document_type', data.document_type)
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('issued_at', new Date(data.issued_at).toISOString())
      if (data.expires_at) {
        formData.append('expires_at', new Date(data.expires_at).toISOString())
      }
      formData.append('is_confidential', String(data.is_confidential))
      formData.append('file', selectedFile)

      await onSubmit(formData)
      form.reset()
      setSelectedFile(null)
    } catch (error) {
      console.error('Error submitting medical document form:', error)
    }
  }

  const documentType = form.watch('document_type')
  const issuedAt = form.watch('issued_at')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carregar Documento Médico</CardTitle>
        <CardDescription>
          Envie documentos médicos para o arquivo do jogador
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-lg">
            {/* Document Type */}
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="medical_certificate">
                        {getMedicalDocumentTypeLabel('medical_certificate')}
                      </SelectItem>
                      <SelectItem value="injury_report">
                        {getMedicalDocumentTypeLabel('injury_report')}
                      </SelectItem>
                      <SelectItem value="scan_result">
                        {getMedicalDocumentTypeLabel('scan_result')}
                      </SelectItem>
                      <SelectItem value="lab_result">
                        {getMedicalDocumentTypeLabel('lab_result')}
                      </SelectItem>
                      <SelectItem value="vaccination_record">
                        {getMedicalDocumentTypeLabel('vaccination_record')}
                      </SelectItem>
                      <SelectItem value="surgery_report">
                        {getMedicalDocumentTypeLabel('surgery_report')}
                      </SelectItem>
                      <SelectItem value="physical_exam">
                        {getMedicalDocumentTypeLabel('physical_exam')}
                      </SelectItem>
                      <SelectItem value="cardiac_screening">
                        {getMedicalDocumentTypeLabel('cardiac_screening')}
                      </SelectItem>
                      <SelectItem value="other">
                        {getMedicalDocumentTypeLabel('other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Classifique o tipo de documento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Documento *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Certificado Médico - Exame Anual 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Máximo 255 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes adicionais sobre o documento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Máximo 1000 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issue Date */}
            <FormField
              control={form.control}
              name="issued_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Emissão *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value).toISOString())
                        } else {
                          field.onChange(null)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Não pode ser no futuro</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value).toISOString())
                        } else {
                          field.onChange(null)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Deixe em branco se o documento não expira
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <FormItem>
              <FormLabel>Ficheiro Médico *</FormLabel>
              <div className="border-2 border-dashed border-outline rounded-lg p-lg">
                <div className="flex items-center justify-center gap-md">
                  <Upload className="h-6 w-6 text-on-surface-variant/50" />
                  <div className="text-center">
                    <label htmlFor="file-input" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary">
                        Clique para selecionar
                      </span>
                      <span className="text-sm text-on-surface-variant"> ou arraste aqui</span>
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    />
                    <p className="mt-sm text-xs text-on-surface-variant">
                      PDF, JPG, PNG, WEBP, DOC, DOCX — Máx. 10MB
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-md p-md bg-green-50 rounded flex items-center gap-md">
                    <FileText className="h-4 w-4 text-green-700" />
                    <div className="text-sm">
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}

                {fileSizeError && (
                  <div className="mt-md p-md bg-red-50 rounded flex items-center gap-md">
                    <AlertCircle className="h-4 w-4 text-red-700" />
                    <p className="text-sm text-red-700">{fileSizeError}</p>
                  </div>
                )}
              </div>
              <FormDescription className="mt-sm">
                {selectedFile
                  ? 'Ficheiro selecionado com sucesso'
                  : 'Nenhum ficheiro selecionado'}
              </FormDescription>
            </FormItem>

            {/* Confidentiality */}
            <div className="flex items-center gap-md p-md bg-surface/50 rounded-lg">
              <input
                type="checkbox"
                id="is_confidential"
                {...form.register('is_confidential')}
                defaultChecked={true}
                className="h-4 w-4 rounded border-outline"
              />
              <label htmlFor="is_confidential" className="text-sm font-medium cursor-pointer">
                Documento Confidencial (🔒 Acessível apenas a pessoal médico autorizado)
              </label>
            </div>

            {/* Info Alert */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-md">
              <div className="flex gap-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-700" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Verificação de Documentos</p>
                  <p className="mt-sm">
                    O documento será enviado para verificação por pessoal médico autorizado. A status passará de "Pendente" a "Verificado" após aprovação.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-md pt-md">
              <Button type="submit" disabled={isLoading || !selectedFile} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-md h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-md h-4 w-4" />
                    Carregar Documento
                  </>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
