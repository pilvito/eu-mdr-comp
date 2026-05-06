import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ChecklistStep from '../../src/components/ChecklistStep'
import { ClipboardList } from 'lucide-react'

const FIVE_TASKS = [
  { id: '1', title: 'Design Controls', description: 'Establish procedures.' },
  { id: '2', title: 'Risk Management', description: 'ISO 14971.' },
  { id: '3', title: 'Software Dev Planning', description: 'IEC 62304.' },
  { id: '4', title: 'Traceability', description: 'Top-down traceability.' },
  { id: '5', title: 'Supplier Control', description: 'Qualify suppliers.' },
]

function renderChecklist(overrides: { stepNumber?: number | string; tasks?: typeof FIVE_TASKS } = {}) {
  const props = {
    stepNumber: overrides.stepNumber ?? 3,
    title: 'Test Checklist',
    description: 'Test description',
    icon: ClipboardList,
    tasks: overrides.tasks ?? FIVE_TASKS,
    prevStep: '/step-2',
    nextStep: '/step-4',
  }

  return render(
    <MemoryRouter initialEntries={['/step-3']}>
      <Routes>
        <Route path="/step-3" element={<ChecklistStep {...props} />} />
        <Route path="/step-2" element={<div>Step 2 Page</div>} />
        <Route path="/step-4" element={<div>Step 4 Page</div>} />
        <Route path="/step-9" element={<ChecklistStep {...props} stepNumber={9} nextStep="/" />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ChecklistStep component', () => {
  it('cl.inv.01: shows 0% progress on initial render', () => {
    renderChecklist()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('cl.inv.02: progress stays within 0-100 range', () => {
    renderChecklist()
    FIVE_TASKS.forEach(task => {
      fireEvent.click(screen.getByText(task.title))
    })
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('cl.react.01: clicking one task shows 20% progress (1 of 5)', () => {
    renderChecklist()
    fireEvent.click(screen.getByText('Design Controls'))
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('cl.inv.05: clicking a completed task un-completes it', () => {
    renderChecklist()
    fireEvent.click(screen.getByText('Design Controls'))
    expect(screen.getByText('20%')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Design Controls'))
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('cl.prog.01: toggling all tasks shows 100%', () => {
    renderChecklist()
    FIVE_TASKS.forEach(task => {
      fireEvent.click(screen.getByText(task.title))
    })
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('cl.inv.06: Continue button is always enabled (not disabled)', () => {
    renderChecklist()
    const continueBtn = screen.getByRole('button', { name: /continue to step 4/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('cl.inv.06: Continue button enabled even with zero tasks completed', () => {
    renderChecklist()
    const continueBtn = screen.getByRole('button', { name: /continue to step 4/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('cl.react.04: stepNumber < 9 shows "Continue to Step N+1" label', () => {
    renderChecklist({ stepNumber: 3 })
    expect(screen.getByRole('button', { name: /continue to step 4/i })).toBeInTheDocument()
  })

  it('cl.react.04: stepNumber = 9 shows "Finish" label', () => {
    const props = {
      stepNumber: 9,
      title: 'Post Market',
      description: 'Post market surveillance',
      icon: ClipboardList,
      tasks: FIVE_TASKS,
      prevStep: '/step-8',
      nextStep: '/',
    }
    render(
      <MemoryRouter initialEntries={['/step-9']}>
        <Routes>
          <Route path="/step-9" element={<ChecklistStep {...props} />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
  })

  it('cl.prog.02: Continue navigates to nextStep', () => {
    renderChecklist()
    fireEvent.click(screen.getByRole('button', { name: /continue to step 4/i }))
    expect(screen.getByText('Step 4 Page')).toBeInTheDocument()
  })

  it('cl.prog.03: Back navigates to prevStep', () => {
    renderChecklist()
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Step 2 Page')).toBeInTheDocument()
  })

  it('cl.progress-count: shows "N of M tasks completed" text', () => {
    renderChecklist()
    expect(screen.getByText(/0 of 5 tasks completed/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Design Controls'))
    expect(screen.getByText(/1 of 5 tasks completed/i)).toBeInTheDocument()
  })
})
