import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Step2 from '../../src/pages/Step2'
import { ProductProvider } from '../../src/context/ProductContext'

function renderStep2() {
  return render(
    <ProductProvider>
      <MemoryRouter initialEntries={['/step-2']}>
        <Routes>
          <Route path="/step-2" element={<Step2 />} />
          <Route path="/step-1" element={<div>Step 1 Page</div>} />
          <Route path="/step-3" element={<div>Step 3 Page</div>} />
        </Routes>
      </MemoryRouter>
    </ProductProvider>
  )
}

function clickButton(name: RegExp | string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

const DURATION_LABEL: Record<string, RegExp> = {
  transient: /transient/i,
  'short-term': /short term/i,
  'long-term': /long term/i,
}

function answerAll({ invasive, active, duration }: { invasive: boolean; active: boolean; duration: string }) {
  clickButton(invasive ? /yes, it is invasive/i : /no, non-invasive/i)
  clickButton(active ? /yes, it is active/i : /no, non-active/i)
  clickButton(DURATION_LABEL[duration])
}

describe('Step2 component', () => {
  it('step2.inv.01: Continue disabled when no answers given', () => {
    renderStep2()
    expect(screen.getByRole('button', { name: /continue to qms/i })).toBeDisabled()
  })

  it('step2.inv.03: partial answers keep Continue disabled', () => {
    renderStep2()
    clickButton(/yes, it is invasive/i)
    expect(screen.getByRole('button', { name: /continue to qms/i })).toBeDisabled()
  })

  it('step2.inv.06: Class I shown for non-invasive, non-active device', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    expect(screen.getByText('Class I')).toBeInTheDocument()
  })

  it('step2.inv.02: Continue enabled when result is shown', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    expect(screen.getByRole('button', { name: /continue to qms/i })).not.toBeDisabled()
  })

  it('step2.inv.04: Class III shown for invasive + long-term', () => {
    renderStep2()
    answerAll({ invasive: true, active: false, duration: 'long-term' })
    expect(screen.getByText('Class III')).toBeInTheDocument()
  })

  it('step2.inv.05: Class IIb shown for active + short-term', () => {
    renderStep2()
    answerAll({ invasive: false, active: true, duration: 'short-term' })
    expect(screen.getByText('Class IIb')).toBeInTheDocument()
  })

  it('step2.iia: Class IIa shown for mixed conditions', () => {
    renderStep2()
    answerAll({ invasive: true, active: false, duration: 'short-term' })
    expect(screen.getByText('Class IIa')).toBeInTheDocument()
  })

  it('step2.inv.07: regulatory caveat text visible when result shown', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    expect(screen.getByText(/refer to mdr annex viii/i)).toBeInTheDocument()
  })

  it('step2.react.01: re-answering a question updates the result', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    expect(screen.getByText('Class I')).toBeInTheDocument()
    clickButton(/yes, it is active/i)
    expect(screen.queryByText('Class I')).not.toBeInTheDocument()
  })

  it('step2.prog.02: Continue navigates to step-3', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    clickButton(/continue to qms/i)
    expect(screen.getByText('Step 3 Page')).toBeInTheDocument()
  })

  it('step2.react.06: Back navigates to step-1', () => {
    renderStep2()
    clickButton(/back to step 1/i)
    expect(screen.getByText('Step 1 Page')).toBeInTheDocument()
  })

  it('step2.ac.02: Class I is shown and Continue is enabled', () => {
    renderStep2()
    answerAll({ invasive: false, active: false, duration: 'transient' })
    expect(screen.getByText('Class I')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue to qms/i })).not.toBeDisabled()
  })
})
