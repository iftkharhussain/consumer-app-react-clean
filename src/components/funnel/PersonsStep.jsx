/**
 * Persons step — "Pour qui est la soumission ?" — a repeatable insured/borrower
 * card (Nom, Prénom, date de naissance, sexe, statut de fumeur, province, and a
 * desired amount), with add/remove and a Retour/Suivant footer.
 *
 * Config (a step with type 'persons'):
 *   { type: 'persons', personLabel?, addLabel?, maxPersons?,
 *     montantLabel?, montantTip? }
 *
 * The persons array is owned by FunnelForm (so it survives tab switches);
 * createPerson() and isPersonsComplete() are exported for it to use.
 */

import React from 'react';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Field, FormGroup, Input, DateInput, BoxSelect, PillToggle, Select, YesNoToggle, ChevronRight, ChevronLeft } from './primitives';
import { isValidName, isValidAmount } from '../../pages/assuranceVie/formValidation';
import styles from './funnel.module.css';
import local from './funnel.module.css';

const PROVINCES = [
  'Québec', 'Ontario', 'Alberta', 'Colombie-Britannique', 'Manitoba',
  'Nouveau-Brunswick', 'Nouvelle-Écosse', 'Saskatchewan',
  'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard',
  'Territoires du Nord-Ouest', 'Nunavut', 'Yukon',
].map((p) => ({ value: p, label: p }));

const FUMEUR_TIP = <span>Inclut cigarettes, vapoteuse, tabac à pipe, cigares, chicha, etc.</span>;
const DEFAULT_MONTANT_TIP = <span>Choisissez un montant adapté à vos besoins (solde hypothécaire, dettes, etc.).</span>;

export function createPerson(montant = '') {
  return {
    id: Math.random().toString(36).slice(2),
    nom: '', prenom: '', dateNaissance: '', sexe: '', fumeur: 'non', province: 'Québec', montant: montant || '',
  };
}

export function isPersonsComplete(persons) {
  return (persons || []).every(
    (p) => isValidName(p.nom) && isValidName(p.prenom) && p.dateNaissance && p.sexe && isValidAmount(p.montant),
  );
}

function PersonCard({ person, index, personLabel, firstPersonLabel, montantLabel, montantTip, montantSuffix, extraFields, reco, suggestion, onChange, onRemove, canRemove }) {
  const set = (f) => (v) => onChange({ ...person, [f]: v });
  const header = index === 0 && firstPersonLabel ? firstPersonLabel : `${personLabel} ${index + 1}`;

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f2f5' }}>
        <span style={{ fontFamily: 'Inter', fontSize: 13, fontStyle: 'normal', fontWeight: 600, lineHeight: '19.5px', color: '#364152', letterSpacing: '-0.1px' }}>
          {header}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove} style={{ color: '#c0cad4', background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
            <CloseOutlined style={{ fontSize: 13 }} />
          </button>
        )}
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormGroup>
          <div className={styles.grid2}>
            <Field label="Nom" error={person.nom && !isValidName(person.nom) ? 'Entrez un nom valide' : ''}>
              <Input value={person.nom} onChange={set('nom')} placeholder="Dupont" filter="name" error={!!(person.nom && !isValidName(person.nom))} />
            </Field>
            <Field label="Prénom" error={person.prenom && !isValidName(person.prenom) ? 'Entrez un prénom valide' : ''}>
              <Input value={person.prenom} onChange={set('prenom')} placeholder="Marie" filter="name" error={!!(person.prenom && !isValidName(person.prenom))} />
            </Field>
          </div>

          <div className={styles.gridResp2}>
            <Field label="Date de naissance">
              <DateInput value={person.dateNaissance} onChange={set('dateNaissance')} />
            </Field>
            <Field label="Sexe à la naissance">
              <BoxSelect value={person.sexe} onChange={set('sexe')} options={[{ value: 'homme', label: 'Homme' }, { value: 'femme', label: 'Femme' }]} />
            </Field>
          </div>

          <div className={styles.gridResp2}>
            <Field label="Statut de fumeur" tip={FUMEUR_TIP}>
              <PillToggle value={person.fumeur} onChange={set('fumeur')} options={[{ value: 'non', label: 'Non-fumeur' }, { value: 'oui', label: 'Fumeur' }]} />
            </Field>
            <Field label="Province">
              <Select value={person.province} onChange={set('province')} options={PROVINCES} />
            </Field>
          </div>

          {(extraFields || []).map((f) => (
            <Field key={f.key} label={f.label} tip={f.tip}>
              {f.inputType === 'yesno' ? (
                <YesNoToggle value={person[f.key]} onChange={set(f.key)} />
              ) : f.inputType === 'pill' ? (
                <PillToggle value={person[f.key]} onChange={set(f.key)} options={f.options} />
              ) : (
                <Input value={person[f.key] || ''} onChange={set(f.key)} placeholder={f.placeholder} />
              )}
            </Field>
          ))}
        </FormGroup>

        <FormGroup>
          {reco && suggestion > 0 ? (
            <div>
              <p className={local.recoLabel}>{reco.label}</p>
              <p className={local.recoAmount}>{reco.format(suggestion)}</p>
            </div>
          ) : suggestion > 0 ? (
            <p style={{ fontSize: 12, color: '#697586', lineHeight: 1.6, margin: 0 }}>
              Selon vos réponses, nous vous suggérons une couverture de{' '}
              <strong style={{ color: '#1a1aba' }}>{suggestion.toLocaleString('fr-CA')} $</strong>.
            </p>
          ) : null}
          <Field label={montantLabel} tip={montantTip}>
            <div style={{ width: '100%', maxWidth: 298 }}>
              <Input type="text" inputMode="numeric" value={person.montant} onChange={set('montant')} placeholder="250 000" prefix="$" suffix={montantSuffix} filter="digits" />
            </div>
          </Field>
        </FormGroup>
      </div>
    </div>
  );
}

export default function PersonsStep({
  persons, onChange, onNext, onBack,
  personLabel = 'Assuré', firstPersonLabel, addLabel, maxPersons = 2,
  montantLabel = "Montant d'assurance souhaité", montantTip = DEFAULT_MONTANT_TIP,
  montantSuffix, extraFields, reco, suggestion, defaultMontant,
  hideAdd = false, greenNext = false, nextLabel = 'Suivant',
}) {
  const list = persons && persons.length ? persons : [createPerson(defaultMontant)];
  const complete = isPersonsComplete(list);

  const updatePerson = (id, u) => onChange(list.map((x) => (x.id === id ? u : x)));
  const removePerson = (id) => onChange(list.filter((x) => x.id !== id));
  const addPerson = () => { if (list.length < maxPersons) onChange([...list, createPerson(defaultMontant)]); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {list.map((p, i) => (
        <PersonCard
          key={p.id} person={p} index={i} personLabel={personLabel} firstPersonLabel={firstPersonLabel}
          montantLabel={montantLabel} montantTip={montantTip} montantSuffix={montantSuffix}
          extraFields={extraFields} reco={reco} suggestion={suggestion}
          onChange={(u) => updatePerson(p.id, u)}
          onRemove={() => removePerson(p.id)}
          canRemove={list.length > 1}
        />
      ))}

      {!hideAdd && list.length < maxPersons && (
        <button type="button" onClick={addPerson} className={styles.addBtn}>
          <PlusOutlined style={{ fontSize: 12 }} /> {addLabel || `Ajouter un ${personLabel.toLowerCase()}`}
        </button>
      )}

      {greenNext ? (
        // Short-form (internal) step 1: a single big green CTA, no back button.
        <button type="button" onClick={onNext} disabled={!complete} className={styles.btnGreen}>
          {nextLabel} <ChevronRight size={16} />
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          {onBack ? (
            <button type="button" onClick={onBack} className={styles.btnGhost}>
              <ChevronLeft /> Retour
            </button>
          ) : <span />}
          <button type="button" onClick={onNext} disabled={!complete} className={styles.btnPrimary}>
            {nextLabel} <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
