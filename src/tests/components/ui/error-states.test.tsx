import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PermissionDenied, NotFound, ValidationError, ServerError } from '@/components/ui/error-states'

describe('PermissionDenied', () => {
  it('should render default title and message', () => {
    render(<PermissionDenied />)

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument()
    expect(screen.getByText(/Não tem permissão/)).toBeInTheDocument()
  })

  it('should render custom title and message', () => {
    render(
      <PermissionDenied
        title="Acesso Restrito"
        message="Apenas administradores podem aceder."
      />
    )

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument()
    expect(screen.getByText('Apenas administradores podem aceder.')).toBeInTheDocument()
  })

  it('should render action button when onAction provided', () => {
    const onAction = vi.fn()
    render(<PermissionDenied onAction={onAction} />)

    const button = screen.getByRole('button', { name: /voltar/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    const { container } = render(<PermissionDenied className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('NotFound', () => {
  it('should render default title and message', () => {
    render(<NotFound />)

    expect(screen.getByText('Não Encontrado')).toBeInTheDocument()
    expect(screen.getByText(/recurso que procura/)).toBeInTheDocument()
  })

  it('should render with custom resource name', () => {
    render(<NotFound resourceName="organização" />)

    expect(screen.getByText(/organização que procura/)).toBeInTheDocument()
  })

  it('should render custom message when provided', () => {
    render(<NotFound message="Esta página não existe." />)

    expect(screen.getByText('Esta página não existe.')).toBeInTheDocument()
  })

  it('should render action button when onAction provided', () => {
    const onAction = vi.fn()
    render(<NotFound onAction={onAction} actionLabel="Ir para Início" />)

    const button = screen.getByRole('button', { name: /ir para início/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

describe('ValidationError', () => {
  it('should render default title and message', () => {
    render(<ValidationError />)

    expect(screen.getByText('Erro de Validação')).toBeInTheDocument()
    expect(screen.getByText('Os dados fornecidos não são válidos.')).toBeInTheDocument()
  })

  it('should render list of errors', () => {
    const errors = ['O nome é obrigatório', 'O email deve ser válido']
    render(<ValidationError errors={errors} />)

    expect(screen.getByText('O nome é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('O email deve ser válido')).toBeInTheDocument()
  })

  it('should render action button when onAction provided', () => {
    const onAction = vi.fn()
    render(<ValidationError onAction={onAction} />)

    const button = screen.getByRole('button', { name: /corrigir/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

describe('ServerError', () => {
  it('should render default title and message', () => {
    render(<ServerError />)

    expect(screen.getByText('Erro Interno')).toBeInTheDocument()
    expect(screen.getByText(/erro interno no servidor/)).toBeInTheDocument()
  })

  it('should render custom title and message', () => {
    render(
      <ServerError
        title="Servidor Indisponível"
        message="O servidor está em manutenção."
      />
    )

    expect(screen.getByText('Servidor Indisponível')).toBeInTheDocument()
    expect(screen.getByText('O servidor está em manutenção.')).toBeInTheDocument()
  })

  it('should render retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    render(<ServerError onRetry={onRetry} />)

    const button = screen.getByRole('button', { name: /tentar novamente/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
