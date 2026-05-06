import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { onboardingMachine } from '../../../src/machines/onboardingMachine'

function makeActor() {
  const actor = createActor(onboardingMachine)
  actor.start()
  return actor
}

describe('onboardingMachine', () => {
  it('obm.init: starts in modeSelect', () => {
    const a = makeActor()
    expect(a.getSnapshot().value).toBe('modeSelect')
    a.stop()
  })

  // ── Mode selection ────────────────────────────────────────────────────────

  it('obm.mode.repo: SELECT_MODE(repo) → repoEntry', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    expect(a.getSnapshot().value).toBe('repoEntry')
    expect(a.getSnapshot().context.mode).toBe('repo')
    a.stop()
  })

  it('obm.mode.freetext: SELECT_MODE(freetext) → freetextEntry', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    expect(a.getSnapshot().value).toBe('freetextEntry')
    a.stop()
  })

  it('obm.mode.document: SELECT_MODE(document) → documentUpload', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'document' })
    expect(a.getSnapshot().value).toBe('documentUpload')
    a.stop()
  })

  it('obm.mode.wizard: SELECT_MODE(wizard) → wizardQA', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    expect(a.getSnapshot().value).toBe('wizardQA')
    a.stop()
  })

  // ── Back from any mode → modeSelect ──────────────────────────────────────

  it('obm.back: BACK from repoEntry → modeSelect, mode reset', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('modeSelect')
    expect(a.getSnapshot().context.mode).toBeNull()
    a.stop()
  })

  it('obm.back: BACK from freetextEntry → modeSelect', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'some text that I typed' })
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('modeSelect')
    expect(a.getSnapshot().context.freeText).toBe('')
    a.stop()
  })

  it('obm.back: BACK from wizardQA → modeSelect', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('modeSelect')
    a.stop()
  })

  it('obm.back: BACK from previewing → modeSelect', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'A twenty-plus character description of my medical device product here' })
    a.send({ type: 'SUBMIT_TEXT' })
    expect(a.getSnapshot().value).toBe('previewing')
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('modeSelect')
    a.stop()
  })

  // ── Repo mode ─────────────────────────────────────────────────────────────

  it('obm.repo.invalid: SUBMIT_REPO with invalid URL stays in repoEntry + sets error', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    a.send({ type: 'SET_REPO_URL', value: 'not-a-url' })
    a.send({ type: 'SUBMIT_REPO' })
    expect(a.getSnapshot().value).toBe('repoEntry')
    expect(a.getSnapshot().context.repoUrlError).toBeTruthy()
    a.stop()
  })

  it('obm.repo.valid: SUBMIT_REPO with valid GitHub URL → previewing', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    a.send({ type: 'SET_REPO_URL', value: 'https://github.com/acme/cardiac-monitor' })
    a.send({ type: 'SUBMIT_REPO' })
    expect(a.getSnapshot().value).toBe('previewing')
    expect(a.getSnapshot().context.parsedProductName).toBe('Cardiac Monitor')
    a.stop()
  })

  it('obm.repo.gitlab: gitlab URL is also valid', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    a.send({ type: 'SET_REPO_URL', value: 'https://gitlab.com/org/my-samd-app' })
    a.send({ type: 'SUBMIT_REPO' })
    expect(a.getSnapshot().value).toBe('previewing')
    a.stop()
  })

  it('obm.repo.description: parsed description includes repo URL', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'repo' })
    a.send({ type: 'SET_REPO_URL', value: 'https://github.com/acme/ecg-tool' })
    a.send({ type: 'SUBMIT_REPO' })
    expect(a.getSnapshot().context.parsedDescription).toContain('github.com')
    a.stop()
  })

  // ── Free text mode ────────────────────────────────────────────────────────

  it('obm.freetext.short: SUBMIT_TEXT with < 20 chars stays in freetextEntry', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'too short' })
    a.send({ type: 'SUBMIT_TEXT' })
    expect(a.getSnapshot().value).toBe('freetextEntry')
    a.stop()
  })

  it('obm.freetext.exact20: exactly 20 chars is accepted', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: '12345678901234567890' })
    a.send({ type: 'SUBMIT_TEXT' })
    expect(a.getSnapshot().value).toBe('previewing')
    a.stop()
  })

  it('obm.freetext.long: long text → previewing with parsedIntendedUse set', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'A device that monitors cardiac arrhythmias in real time.' })
    a.send({ type: 'SUBMIT_TEXT' })
    expect(a.getSnapshot().value).toBe('previewing')
    expect(a.getSnapshot().context.parsedIntendedUse).toContain('cardiac')
    a.stop()
  })

  // ── Document mode ─────────────────────────────────────────────────────────

  it('obm.doc.no-file: SUBMIT_DOCUMENT with no file stays in documentUpload', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'document' })
    a.send({ type: 'SUBMIT_DOCUMENT' })
    expect(a.getSnapshot().value).toBe('documentUpload')
    a.stop()
  })

  it('obm.doc.file: FILE_SELECTED then SUBMIT_DOCUMENT → previewing', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'document' })
    a.send({ type: 'FILE_SELECTED', name: 'cardiac-monitor-spec.md', content: 'The device monitors cardiac...' })
    a.send({ type: 'SUBMIT_DOCUMENT' })
    expect(a.getSnapshot().value).toBe('previewing')
    expect(a.getSnapshot().context.parsedProductName).toBe('Cardiac Monitor Spec')
    a.stop()
  })

  it('obm.doc.description: description mentions document name', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'document' })
    a.send({ type: 'FILE_SELECTED', name: 'my-spec.pdf', content: 'Device intended use...' })
    a.send({ type: 'SUBMIT_DOCUMENT' })
    expect(a.getSnapshot().context.parsedDescription).toContain('my-spec.pdf')
    a.stop()
  })

  // ── Wizard mode ───────────────────────────────────────────────────────────

  it('obm.wizard.answer: ANSWER_WIZARD updates wizardAnswers', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    a.send({ type: 'ANSWER_WIZARD', questionId: 'productName', answer: 'CardioScan Pro' })
    expect(a.getSnapshot().context.wizardAnswers.productName).toBe('CardioScan Pro')
    a.stop()
  })

  it('obm.wizard.advance: NEXT_WIZARD_STEP increments wizardStep', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    expect(a.getSnapshot().context.wizardStep).toBe(0)
    a.send({ type: 'NEXT_WIZARD_STEP' })
    expect(a.getSnapshot().context.wizardStep).toBe(1)
    a.stop()
  })

  it('obm.wizard.submit-incomplete: SUBMIT_WIZARD without required answers stays in wizardQA', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    a.send({ type: 'SUBMIT_WIZARD' })
    expect(a.getSnapshot().value).toBe('wizardQA')
    a.stop()
  })

  it('obm.wizard.submit-complete: SUBMIT_WIZARD with productName+intendedUse → previewing', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'wizard' })
    a.send({ type: 'ANSWER_WIZARD', questionId: 'productName', answer: 'CardioScan Pro' })
    a.send({ type: 'ANSWER_WIZARD', questionId: 'intendedUse', answer: 'Monitor cardiac rhythms in ICU patients.' })
    a.send({ type: 'SUBMIT_WIZARD' })
    expect(a.getSnapshot().value).toBe('previewing')
    expect(a.getSnapshot().context.parsedProductName).toBe('CardioScan Pro')
    expect(a.getSnapshot().context.parsedIntendedUse).toContain('cardiac')
    a.stop()
  })

  // ── Preview ───────────────────────────────────────────────────────────────

  it('obm.preview.edit: SET_PREVIEW_FIELD updates preview fields', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'A medical device that helps patients manage their chronic conditions.' })
    a.send({ type: 'SUBMIT_TEXT' })
    a.send({ type: 'SET_PREVIEW_FIELD', field: 'parsedProductName', value: 'Chronic Care Monitor' })
    expect(a.getSnapshot().context.parsedProductName).toBe('Chronic Care Monitor')
    a.stop()
  })

  it('obm.preview.confirm: CONFIRM → confirmed (final state)', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_MODE', mode: 'freetext' })
    a.send({ type: 'SET_TEXT', value: 'A device that monitors vital signs continuously in ICU patients.' })
    a.send({ type: 'SUBMIT_TEXT' })
    a.send({ type: 'CONFIRM' })
    expect(a.getSnapshot().value).toBe('confirmed')
    a.stop()
  })
})
