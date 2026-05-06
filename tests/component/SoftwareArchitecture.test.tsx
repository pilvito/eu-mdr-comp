import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SoftwareArchitecture from '../../src/pages/SoftwareArchitecture'

function renderPage() {
  return render(
    <MemoryRouter>
      <SoftwareArchitecture />
    </MemoryRouter>
  )
}

describe('SoftwareArchitecture component', () => {
  it('arch.inv.01: demo item visible and selected on load (appears in sidebar + detail header)', () => {
    renderPage()
    // Item name appears in both sidebar (h4) and detail panel heading (h2)
    expect(screen.getAllByText('EHR Core Database')).toHaveLength(2)
    // The detail panel h2 heading confirms it is the active item
    expect(screen.getByRole('heading', { name: 'EHR Core Database', level: 2 })).toBeInTheDocument()
  })

  it('arch.inv.02: initial requirement shown as REQ-1', () => {
    renderPage()
    expect(screen.getByText('REQ-1')).toBeInTheDocument()
  })

  it('arch.inv.07: requirements tab is active by default', () => {
    renderPage()
    expect(screen.getByText(/requirements \(5\.2\)/i)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/microservices backend/i)).not.toBeInTheDocument()
  })

  it('arch.react.02: switching to architecture tab shows textarea', () => {
    renderPage()
    fireEvent.click(screen.getByText(/architecture \(5\.3\)/i))
    expect(screen.getByPlaceholderText(/microservices backend/i)).toBeInTheDocument()
  })

  it('arch.react.03: switching back to requirements tab hides textarea', () => {
    renderPage()
    fireEvent.click(screen.getByText(/architecture \(5\.3\)/i))
    fireEvent.click(screen.getByText(/requirements \(5\.2\)/i))
    expect(screen.queryByPlaceholderText(/microservices backend/i)).not.toBeInTheDocument()
  })

  it('arch.inv.03: adding empty requirement is a no-op', () => {
    renderPage()
    const addBtn = screen.getByRole('button', { name: /add requirement/i })
    fireEvent.click(addBtn)
    expect(screen.queryByText('REQ-2')).not.toBeInTheDocument()
  })

  it('arch.prog.02: adding a valid requirement creates REQ-2', () => {
    renderPage()
    const input = screen.getByPlaceholderText(/enter a new software requirement/i)
    fireEvent.change(input, { target: { value: 'Must support OAuth 2.0' } })
    fireEvent.click(screen.getByRole('button', { name: /add requirement/i }))
    expect(screen.getByText('REQ-2')).toBeInTheDocument()
    expect(screen.getByText('Must support OAuth 2.0')).toBeInTheDocument()
  })

  it('arch.inv.04: submitting empty item name form is a no-op (sidebar still shows 1 item)', () => {
    renderPage()
    const input = screen.getByPlaceholderText(/new component name/i)
    // input is already empty — just submit
    fireEvent.submit(input.closest('form')!)
    // Still only one item in the sidebar (h4 level headings in the list)
    expect(screen.getAllByText('EHR Core Database')).toHaveLength(2)
    expect(screen.queryByText('0 requirements')).not.toBeInTheDocument()
  })

  it('arch.prog.01: adding a valid item shows it in the sidebar and detail panel', () => {
    renderPage()
    const input = screen.getByPlaceholderText(/new component name/i)
    fireEvent.change(input, { target: { value: 'API Gateway' } })
    fireEvent.submit(input.closest('form')!)
    // Auto-activates: name appears in sidebar (h4) AND detail panel (h2)
    expect(screen.getAllByText('API Gateway')).toHaveLength(2)
  })

  it('arch.inv.05: new item auto-activates and shows as the detail panel heading', () => {
    renderPage()
    const input = screen.getByPlaceholderText(/new component name/i)
    fireEvent.change(input, { target: { value: 'Cache Layer' } })
    fireEvent.submit(input.closest('form')!)
    // Level-2 heading is the detail panel title (confirms auto-activation)
    expect(screen.getByRole('heading', { name: 'Cache Layer', level: 2 })).toBeInTheDocument()
  })

  it('arch.react.01: selecting a different item updates the detail panel', () => {
    renderPage()
    const input = screen.getByPlaceholderText(/new component name/i)
    fireEvent.change(input, { target: { value: 'Reporting Service' } })
    fireEvent.submit(input.closest('form')!)
    // Click the sidebar entry for the original demo item
    const sidebarItem = screen.getAllByText('EHR Core Database')[0]
    fireEvent.click(sidebarItem)
    expect(screen.getByText('Must support 10,000 concurrent patient record fetches.')).toBeInTheDocument()
  })

  it('arch.inv.06: Save button shows "Save Item" initially', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /save item/i })).toBeInTheDocument()
  })

  it('arch.prog.03: clicking Save shows "Saved!" text', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /save item/i }))
    expect(screen.getByRole('button', { name: /saved!/i })).toBeInTheDocument()
  })

  describe('Save revert after 2s', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('arch.inv.06: Save button reverts to "Save Item" after 2 seconds', async () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /save item/i }))
      expect(screen.getByRole('button', { name: /saved!/i })).toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(2000)
      })
      expect(screen.getByRole('button', { name: /save item/i })).toBeInTheDocument()
    })
  })

  it('arch.react.04: architecture text updates are reflected in textarea', () => {
    renderPage()
    fireEvent.click(screen.getByText(/architecture \(5\.3\)/i))
    const textarea = screen.getByPlaceholderText(/microservices backend/i)
    fireEvent.change(textarea, { target: { value: 'Event-driven architecture' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('Event-driven architecture')
  })
})
