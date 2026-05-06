import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Step1 from '../../src/pages/Step1'

function renderStep1() {
  return render(
    <MemoryRouter initialEntries={['/step-1']}>
      <Routes>
        <Route path="/step-1" element={<Step1 />} />
        <Route path="/step-2" element={<div>Step 2 Page</div>} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function fillIntendedUse(text: string) {
  const textarea = screen.getByPlaceholderText(/describe explicitly/i)
  fireEvent.change(textarea, { target: { value: text } })
}

function answerClaim(label: RegExp, answer: 'Yes' | 'No') {
  const card = screen.getAllByRole('button', { name: answer })
    .find(btn => btn.closest('[class*="glass-card"]')?.textContent?.match(label))
  if (!card) throw new Error(`Claim button not found for ${label}`)
  fireEvent.click(card)
}

function answerAllClaims(value: boolean) {
  const buttons = screen.getAllByRole('button', { name: value ? 'Yes' : 'No' })
  buttons.forEach(btn => fireEvent.click(btn))
}

describe('Step1 component', () => {
  it('step1.inv.01: Continue button is disabled on initial render', () => {
    renderStep1()
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).toBeDisabled()
  })

  it('step1.inv.03: short intended use (5 chars) does not enable Continue even with all claims true', () => {
    renderStep1()
    fillIntendedUse('hello')
    answerAllClaims(true)
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).toBeDisabled()
  })

  it('step1.inv.04: long use but partial answers keeps Continue disabled', () => {
    renderStep1()
    fillIntendedUse('This is a valid device description')
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).toBeDisabled()
  })

  it('step1.inv.05.bugfix: exactly 10 chars + all claims true enables Continue (>= 10 fix)', () => {
    renderStep1()
    fillIntendedUse('1234567890')
    answerAllClaims(true)
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('step1.inv.02: RESULT_POSITIVE enables Continue button', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(false)
    const yesButtons = screen.getAllByRole('button', { name: 'Yes' })
    fireEvent.click(yesButtons[0])
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('step1.inv.01: RESULT_NEGATIVE keeps Continue disabled', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(false)
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    expect(continueBtn).toBeDisabled()
  })

  it('step1.react.03: RESULT_NEGATIVE shows danger-colored result card', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(false)
    expect(screen.getByText(/likely not a medical device/i)).toBeInTheDocument()
  })

  it('step1.react.04: RESULT_POSITIVE shows positive result card', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(true)
    expect(screen.getByText(/likely a medical device/i)).toBeInTheDocument()
  })

  it('step1.react.02: switching a claim from true to false updates result', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(true)
    expect(screen.getByText(/likely a medical device/i)).toBeInTheDocument()
    answerAllClaims(false)
    expect(screen.getByText(/likely not a medical device/i)).toBeInTheDocument()
  })

  it('step1.react.05: Back button navigates to dashboard', () => {
    renderStep1()
    const backBtn = screen.getByRole('button', { name: /back to dashboard/i })
    fireEvent.click(backBtn)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('step1.prog.02: Continue navigates to step-2 when result is positive', () => {
    renderStep1()
    fillIntendedUse('Cardiac monitoring device')
    answerAllClaims(true)
    const continueBtn = screen.getByRole('button', { name: /continue to classification/i })
    fireEvent.click(continueBtn)
    expect(screen.getByText('Step 2 Page')).toBeInTheDocument()
  })

  it('step1.ac.09: exactly 10 chars with one true claim shows positive result', () => {
    renderStep1()
    fillIntendedUse('1234567890')
    answerAllClaims(false)
    const yesButtons = screen.getAllByRole('button', { name: 'Yes' })
    fireEvent.click(yesButtons[0])
    expect(screen.getByText(/likely a medical device/i)).toBeInTheDocument()
  })
})
