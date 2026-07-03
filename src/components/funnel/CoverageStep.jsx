/**
 * Config-driven progressive quiz step (used by any funnel step that asks a
 * sequence of questions — e.g. "Vos renseignements", "Vos préférences").
 *
 * Each question in `quiz` is a config object:
 *   { key, label, summaryLabel?, description?,
 *     inputType: 'choice' | 'multiselect' | 'text' | 'number' | 'yesno' | 'monthYear',
 *     options?, placeholder?, prefix?, suffix?, tip?, columns?,
 *     optional?, yearsAhead?, formatSummary?(value, answers), showIf?(answers) }
 *
 * Answered questions collapse into an editable summary; the first unanswered one
 * is shown. `optional` questions never block completion — once every required
 * question is answered the step is "done" (Suivant appears) while a trailing
 * optional question stays visible so the user may still fill it.
 */

import React, { useState, useEffect } from 'react';
import { RightOutlined, LeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Select, YesNoToggle, PillToggle, InfoTooltip } from './primitives';
import { isValidAmount } from '../../pages/assuranceVie/formValidation';
import styles from './funnel.module.css';
import local from './funnel.module.css';

const DEFAULT_DONE = "Vos besoins sont bien définis. Passez à l'étape suivante.";

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Years offered for "when" questions: current year through +10 (the date is in
// the future). `q.yearsAhead` can override the span per question.
function buildYearOptions(yearsAhead = 10) {
  const start = new Date().getFullYear();
  const years = [];
  for (let y = start; y <= start + yearsAhead; y += 1) years.push({ value: String(y), label: String(y) });
  return years;
}

function isAnswered(q, answers) {
  const v = answers[q.key];
  if (q.inputType === 'multiselect') return Array.isArray(v) && v.length > 0;
  if (q.inputType === 'number') return isValidAmount(v);
  return !!v;
}

export default function CoverageStep({ quiz, answers, onChange, onNext, onBack, doneMessage, blockIf, blockedTitle, blockedText }) {
  const [draft, setDraft] = useState('');
  const [monthYear, setMonthYear] = useState({ month: '', year: '' });
  const [multiDraft, setMultiDraft] = useState([]);

  // A disqualifying answer (e.g. "already diagnosed") halts the funnel here.
  const isBlocked = blockIf ? blockIf(answers) : false;

  const sequence = quiz.filter((q) => !q.showIf || q.showIf(answers));
  const required = sequence.filter((q) => !q.optional);
  const firstRequiredUnanswered = required.find((q) => !isAnswered(q, answers));
  const isDone = !isBlocked && !firstRequiredUnanswered;

  // While required questions remain, show the first one. Once they're all done,
  // surface a trailing optional question (if any) so it can still be filled.
  const currentKey = firstRequiredUnanswered
    ? firstRequiredUnanswered.key
    : (sequence.find((q) => q.optional)?.key ?? null);
  const currentQ = isBlocked ? null : sequence.find((q) => q.key === currentKey);

  // Summary lists answered, non-optional questions (an optional one stays inline).
  const answered = sequence.filter((q) => !q.optional && isAnswered(q, answers));

  useEffect(() => {
    const v = currentKey ? answers[currentKey] : '';
    setDraft(typeof v === 'string' ? v : '');
    setMultiDraft(Array.isArray(v) ? v : []);
    setMonthYear({ month: '', year: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  function pick(q, value) {
    onChange({ ...answers, [q.key]: value });
  }

  function setLive(q, value) {
    onChange({ ...answers, [q.key]: value });
  }

  // Month + year selects auto-commit once both halves are chosen.
  function pickMonthYear(q, part, value) {
    const next = { ...monthYear, [part]: value };
    setMonthYear(next);
    if (next.month && next.year) {
      const label = MONTHS[Number(next.month) - 1] || next.month;
      onChange({ ...answers, [q.key]: `${label} ${next.year}` });
    }
  }

  function confirmText(q) {
    if (!draft.trim()) return;
    onChange({ ...answers, [q.key]: draft.trim() });
  }

  function toggleMulti(value) {
    setMultiDraft((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function editQ(key) {
    const idx = sequence.findIndex((q) => q.key === key);
    const next = { ...answers };
    sequence.slice(idx).forEach((q) => { next[q.key] = q.inputType === 'multiselect' ? [] : ''; });
    onChange(next);
  }

  function displayValue(q) {
    const raw = answers[q.key];
    if (q.formatSummary) return q.formatSummary(raw, answers);
    if (q.inputType === 'choice' || q.inputType === 'pill') return q.options?.find((o) => o.value === raw)?.label ?? raw;
    if (q.inputType === 'multiselect') {
      const arr = Array.isArray(raw) ? raw : [];
      return arr.map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(', ');
    }
    if (q.inputType === 'yesno') return raw === 'oui' ? 'Oui' : 'Non';
    if (q.prefix) return `${q.prefix} ${raw}`;
    return raw;
  }

  const showFooter = onBack || isDone;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={styles.card}>
        {answered.length > 0 && (
          <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column' }}>
            {answered.map((q, i) => (
              <div key={q.key} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f0f2f5' }}>
                <span style={{ fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 400, lineHeight: '18px', color: '#9baab8', display: 'block', marginBottom: 2 }}>{q.summaryLabel || q.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 600, lineHeight: '18px', color: '#364152' }}>{displayValue(q)}</span>
                  <button type="button" onClick={() => editQ(q.key)} className={styles.linkBtn} style={{ fontSize: 11 }}>
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isBlocked && (
          <div style={{ padding: answered.length > 0 ? '16px 20px 20px' : '20px', borderTop: answered.length > 0 ? '1px solid #f0f2f5' : 'none' }}>
            <div style={{ display: 'flex', gap: 12, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ marginTop: 2, flexShrink: 0, width: 20, height: 20, borderRadius: 999, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseOutlined style={{ fontSize: 11, color: '#ef4444' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c', margin: '0 0 2px' }}>{blockedTitle || 'Soumission non disponible'}</p>
                <p style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.6, margin: 0 }}>{blockedText}</p>
              </div>
            </div>
          </div>
        )}

        {currentQ && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch', padding: answered.length > 0 ? '16px 20px 20px' : '20px', borderTop: answered.length > 0 ? '1px solid #f0f2f5' : 'none' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, fontStyle: 'normal', fontWeight: 600, lineHeight: '21px', color: '#121926', letterSpacing: '-0.15px', margin: 0 }}>{currentQ.label}</p>
                {currentQ.tip && <InfoTooltip content={currentQ.tip} />}
              </div>
              {currentQ.description && (
                <p style={{ fontSize: 13, color: '#9baab8', margin: '4px 0 0', lineHeight: 1.5 }}>{currentQ.description}</p>
              )}
            </div>

            {currentQ.inputType === 'yesno' ? (
              <YesNoToggle value={answers[currentQ.key]} onChange={(v) => pick(currentQ, v)} />
            ) : currentQ.inputType === 'pill' ? (
              <div style={{ width: currentQ.width || '50%' }}>
                <PillToggle value={answers[currentQ.key]} onChange={(v) => pick(currentQ, v)} options={currentQ.options} />
              </div>
            ) : currentQ.inputType === 'multiselect' ? (
              <>
                <div className={currentQ.columns === 1 ? styles.choiceGrid1 : styles.choiceGrid2}>
                  {currentQ.options.map((o) => {
                    const sel = multiDraft.includes(o.value);
                    return (
                      <button
                        key={o.value} type="button" onClick={() => toggleMulti(o.value)}
                        className={styles.choice}
                        style={sel ? { borderColor: '#1A1ABA', background: '#F0F0FF', color: '#1A1ABA' } : undefined}
                      >
                        <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sel ? '#1a1aba' : '#cdd5df'}`, background: sel ? '#1a1aba' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {sel && <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />}
                        </span>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button" onClick={() => onChange({ ...answers, [currentQ.key]: multiDraft })}
                    disabled={!multiDraft.length} className={styles.btnPrimary}
                    style={!multiDraft.length ? { opacity: 0.5 } : undefined}
                  >
                    Continuer <RightOutlined style={{ fontSize: 12 }} />
                  </button>
                </div>
              </>
            ) : currentQ.optional && (currentQ.inputType === 'text' || currentQ.inputType === 'number') ? (
              <Input
                type="text"
                inputMode={currentQ.inputType === 'number' ? 'numeric' : undefined}
                value={answers[currentQ.key] || ''}
                onChange={(v) => setLive(currentQ, v)}
                placeholder={currentQ.placeholder}
                prefix={currentQ.prefix}
                suffix={currentQ.suffix}
                filter={currentQ.inputType === 'number' ? 'digits' : undefined}
              />
            ) : currentQ.inputType === 'text' || currentQ.inputType === 'number' ? (
              <div className={local.textRow}>
                <div className={local.textRowField}>
                  <Input
                    type="text"
                    inputMode={currentQ.inputType === 'number' ? 'numeric' : undefined}
                    value={draft}
                    onChange={setDraft}
                    placeholder={currentQ.placeholder}
                    prefix={currentQ.prefix}
                    suffix={currentQ.suffix}
                    filter={currentQ.inputType === 'number' ? 'digits' : undefined}
                  />
                </div>
                <button type="button" onClick={() => confirmText(currentQ)} disabled={!draft.trim()} className={local.okBtn}>
                  <CheckOutlined style={{ fontSize: 14 }} />
                </button>
              </div>
            ) : currentQ.inputType === 'monthYear' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    value={monthYear.month}
                    onChange={(v) => pickMonthYear(currentQ, 'month', v)}
                    options={[{ value: '', label: 'Mois' }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    value={monthYear.year}
                    onChange={(v) => pickMonthYear(currentQ, 'year', v)}
                    options={[{ value: '', label: 'Année' }, ...buildYearOptions(currentQ.yearsAhead)]}
                  />
                </div>
              </div>
            ) : (
              <div className={currentQ.columns === 2 ? styles.choiceGrid2 : styles.choiceGrid1}>
                {currentQ.options.map((o) => (
                  <button key={o.value} type="button" onClick={() => pick(currentQ, o.value)} className={styles.choice}>
                    <span className={styles.choiceDot} />
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isDone && !currentQ && (
          <div style={{ padding: '16px 20px 20px', borderTop: answered.length > 0 ? '1px solid #f0f2f5' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #3FC099, #35a882)' }}>
              <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
            </span>
            <span style={{ fontSize: 13, color: '#697586' }}>{doneMessage || DEFAULT_DONE}</span>
          </div>
        )}
      </div>

      {showFooter && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          {onBack ? (
            <button type="button" onClick={onBack} className={styles.btnGhost}>
              <LeftOutlined style={{ fontSize: 12 }} /> Retour
            </button>
          ) : <span />}
          {isDone && (
            <button type="button" onClick={onNext} className={styles.btnPrimary}>
              Suivant <RightOutlined style={{ fontSize: 12 }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
