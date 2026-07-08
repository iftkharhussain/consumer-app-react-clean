/* eslint-disable */
export const driver1Screen = {
    id: '1-driver1',
    type: 'regular',
    stepId: 2,
    title: 'Rejoignez les milliers qui ont comparés l’assurance parfaite',
    subtitle: '',
    driverIcon: true,
    nextScreen: '2-driver1',
    fields: [
        {
            type: 'row',
            gap: '16px',
            fields: [
                {
                    name: 'firstName',
                    type: 'text',
                    label: 'Prénom',
                    placeholder: 'Prénom',
                    required: true,
                },
                {
                    name: 'lastName',
                    type: 'text',
                    label: 'Nom de famille',
                    placeholder: 'Nom de famille',
                    required: true,
                },
            ],
        },
        {
            name: 'gender',
            type: 'buttonGroup',
            label: 'Votre sexe tel qu\'inscrit sur votre permis de conduire?',
            required: true,
            variant: 'radio',
            options: [
                { value: 'homme', label: 'Homme' },
                { value: 'femme', label: 'Femme' },
                { value: 'x', label: 'X' },
            ],
        },
        {
            name: 'dateOfBirth',
            type: 'date',
            label: 'Votre date de naissance?',
            placeholder: 'YYYY-MM-JJ',
            required: true,
            validation: {
                type: 'minAge',
                minAge: 16,
                message: 'Vous devez avoir au moins 16 ans pour souscrire à une assurance'
            },
        },
        {
            name: 'address',
            type: 'address',
            label: 'Quelle est votre adresse complète?',
            placeholder: 'Entrez votre adresse',
            required: true,
        },
        {
            name: 'addressDuration',
            type: 'dropdown',
            label: "Depuis combien d'années habitez-vous à cette adresse?",
            placeholder: 'Sélectionner...',
            required: true,
            showWhen: {
                field: 'address',
                value: 'any',
            },
            options: [
                { value: 'less_than_1', label: "Moins d'un an" },
                { value: '1_year', label: '1 an' },
                { value: '2_years', label: '2 ans' },
                { value: '3_years', label: '3 ans' },
                { value: '4_years', label: '4 ans' },
                { value: '5_plus_years', label: '5 ans et plus' },
            ],
        },
    ],
};

// Occupation options shown both inline and inside the "Diplôme universitaire" popup.
const occupationOptions = [
    { value: 'emploi_temps_plein', label: 'Emploi à temps plein' },
    { value: 'emploi_temps_partiel', label: 'Emploi à temps partiel' },
    { value: 'travailleur_autonome', label: 'Travailleur autonome' },
    { value: 'etudiant', label: 'Étudiant' },
    { value: 'retraite', label: 'Retraité' },
    { value: 'sans_emploi', label: 'Sans emploi' },
];

// "Dans quel domaine travaillez-vous?" — reused inline and inside the popup.
// Its showWhen reveals it only for the 3 employment types (not Étudiant/Retraité).
const professionalStatusField = {
    name: 'professionalStatus',
    type: 'dropdown',
    label: 'Dans quel domaine travaillez-vous?',
    placeholder: 'Sélectionner...',
    showSearch: true,
    required: true,
    showWhen: {
        field: 'universityGraduate',
        value: ['emploi_temps_plein', 'travailleur_autonome', 'emploi_temps_partiel'],
        operator: 'includesAny',
    },
    options: [
        { value: 'agriculture', label: 'Agriculture et ressources naturelles' },
        { value: 'art_design', label: 'Arts, design et médias' },
        { value: 'communication', label: 'Communication, marketing et médias' },
        { value: 'construction', label: 'Construction et métiers' },
        { value: 'education', label: 'Éducation' },
        { value: 'entretien', label: 'Entretien, nettoyage et maintenance' },
        { value: 'fonction_publique', label: 'Fonction publique et gouvernement' },
        { value: 'genie', label: 'Ingénierie et technologie' },
        { value: 'loi_protection', label: 'Droit et sécurité publique' },
        { value: 'multimedia', label: 'Informatique et technologies' },
        { value: 'sante', label: 'Santé' },
        { value: 'science', label: 'Sciences et recherche' },
        { value: 'service_clientele', label: 'Service à la clientèle et ventes' },
        { value: 'services_financiers', label: 'Services financiers' },
        { value: 'services_sociaux', label: 'Services sociaux et communautaires' },
        { value: 'transport', label: 'Transport et machinerie' },
        { value: 'autre', label: 'Autre domaine' },
    ],
};

const professionalStatusDetailField = {
    name: 'professionalStatusDetail',
    type: 'dropdown',
    label: 'Choisissez l\'option qui décrit le mieux votre travail.',
    placeholder: 'Sélectionner...',
    required: true,
    showWhen: {
        field: 'professionalStatus',
        value: ['fonction_publique', 'loi_protection', 'sante', 'services_financiers'],
        operator: 'in',
    },
    conditionalOptions: {
        field: 'professionalStatus',
        optionsMap: {
            fonction_publique: [
                { value: 'gouvernement_federal', label: 'Gouvernement fédéral' },
                { value: 'gouvernement_municipal', label: 'Gouvernement municipal' },
                { value: 'gouvernement_provincial', label: 'Gouvernement provincial' },
                { value: 'autre', label: 'Autre (pompier, travailleur de la poste, etc)' },
            ],
            loi_protection: [
                { value: 'avocat', label: 'Avocat' },
                { value: 'notaire', label: 'Notaire' },
                { value: 'policier', label: 'Policier' },
                { value: 'autre', label: 'Autre' },
            ],
            sante: [
                { value: 'dentiste', label: 'Dentiste' },
                { value: 'docteur', label: 'Docteur' },
                { value: 'employe_clsc', label: 'Employé d\'un CLSC' },
                { value: 'employe_hopital', label: 'Employé d\'un hôpital' },
                { value: 'infirmier', label: 'Infirmier' },
                { value: 'technicien', label: 'Technicien' },
                { value: 'autre', label: 'Autre' },
            ],
            services_financiers: [
                { value: 'actuaire', label: 'Actuaire' },
                { value: 'assurance', label: 'Assurance' },
                { value: 'bancaire', label: 'Bancaire' },
                { value: 'comptable', label: 'Comptable' },
                { value: 'autre', label: 'Autre' },
            ],
        },
    },
};

export const driver2Screen = {
    id: '2-driver1',
    type: 'regular',
    stepId: 2,
    title: 'Rejoignez les milliers qui ont trouvé l’assurance parfaite',
    subtitle: '',
    driverIcon: true,
    nextScreen: '3-driver1',
    fields: [
        {
            name: 'maritalStatus',
            type: 'buttonGroup',
            label: 'Quel est votre état civil?',
            required: true,
            // 3-column grid so the first 3 statuses fill row 1 and "Autre"
            // wraps onto the next row (4 buttons don't fit comfortably in one row).
            columns: 3,
            options: [
                { value: 'celibataire', label: 'Célibataire' },
                // Distinct option value so it doesn't share selection with 'Marié(e)';
                // normalized back to 'marie' on submit (see labeledDataBuilder.js).
                { value: 'conjoint_de_fait', label: 'Conjoint(e) de fait' },
                { value: 'marie', label: 'Marié(e)' },
                { value: 'autre', label: 'Autre' }
            ],
        },
        {
            name: 'universityGraduate',
            type: 'checkboxSelect',
            label: '**Trouvons des rabais ensemble.** Sélectionnez tout ce qui s\'applique à vous.',
            helpText: `*Cela pourrais réduire votre coût d'assurance`,
            // Inline list uses its own explicit order (different from the popup's
            // occupationOptions): Diplôme universitaire sits between Étudiant and
            // Retraité, and "Sans emploi" is intentionally omitted here.
            options: [
                { value: 'emploi_temps_plein', label: 'Emploi à temps plein' },
                { value: 'emploi_temps_partiel', label: 'Emploi à temps partiel' },
                { value: 'travailleur_autonome', label: 'Travailleur autonome' },
                { value: 'etudiant', label: 'Étudiant' },
                { value: 'diplome_universitaire', label: 'Diplôme universitaire' },
                { value: 'retraite', label: 'Retraité' },
            ],
            // When the user submits with ONLY "Diplôme universitaire" selected
            // (which on its own is not an occupation), open this popup to confirm
            // their occupation. It reuses the exact same fields/parameters as the
            // inline form, so the data sent to the backend is unchanged.
            popup: {
                triggerValue: 'diplome_universitaire',
                title: 'Confirmez votre occupation',
                text: 'Svp veuillez confirmer votre occupation en sélectionnant une autre option.',
                fields: [
                    {
                        name: 'universityGraduate',
                        type: 'checkboxSelect',
                        label: 'Sélectionnez tout ce qui s\'applique à vous.',
                        required: true,
                        options: occupationOptions,
                    },
                    professionalStatusField,
                    professionalStatusDetailField,
                ],
            },
        },
        professionalStatusField,
        professionalStatusDetailField,
    ],
};

export const driver3Screen = {
    id: '3-driver1',
    type: 'regular',
    stepId: 2,
    title: 'Rejoignez les milliers qui ont trouvé l\'assurance parfaite',
    subtitle: '',
    driverIcon: true,
    nextScreen: '3b-driver1',
    fields: [
        {
            name: 'insuranceStatus',
            type: 'buttonGroup',
            variant: 'radio',
            buttonWidth: 'calc(50% - 4px)',
            allowWrap: true,
            label: 'Depuis combien de temps avez-vous une assurance auto sans interruption?',
            required: true,
            options: [
                { value: 'no_insurance', label: 'Je n’ai jamais été assuré' },
                { value: '1_year_or_less', label: '1 an ou moins' },
                { value: '2_years', label: '2 ans' },
                { value: '3_years', label: '3 ans' },
                { value: '4_years', label: '4 ans' },
                { value: '5_years_plus', label: '5 ans ou plus' },
            ],
        },
        {
            name: 'currentInsurer',
            type: 'dropdown',
            label: 'Qui est votre assureur automobile actuel?',
            placeholder: 'Sélectionner...',
            required: true,
            showSearch: true,
            showWhen: {
                field: 'insuranceStatus',
                value: 'no_insurance',
                operator: 'notEqual',
            },
            optionGroups: [
                {
                    label: 'Les plus populaires',
                    options: [
                        { value: 'intact_assurance', label: 'Intact' },
                        { value: 'desjardins', label: 'Desjardins' },
                        { value: 'beneva', label: 'Beneva' },
                        { value: 'assurance_promutuel', label: 'Promutuel' },
                        { value: 'belair_direct', label: 'belairdirect' },
                        { value: 'sonnet', label: 'Sonnet' },
                        { value: 'co_operators', label: 'Co-operators' },
                        { value: 'allstate', label: 'Allstate' },
                        { value: 'wawanesa', label: 'Wawanesa' },
                        { value: 'assurance_td', label: 'TD Assurance' },
                        { value: 'la_personnelle', label: 'La Personnelle' },
                        { value: 'lunique', label: "L'Unique" },
                    ],
                },
                {
                    label: 'Autres assureurs',
                    options: [
                        { value: 'allstate_autre', label: 'Allstate' },
                        { value: 'aviva_canada', label: 'Aviva' },
                        { value: 'belair_direct_autre', label: 'belairdirect' },
                        { value: 'beneva_autre', label: 'Beneva' },
                        { value: 'assurance_caa', label: 'CAA' },
                        { value: 'chubb', label: 'Chubb' },
                        { value: 'co_operators_autre', label: 'Co-operators' },
                        { value: 'desjardins_autre', label: 'Desjardins' },
                        { value: 'assurance_economical', label: 'Economical' },
                        { value: 'echelon', label: 'Echelon' },
                        { value: 'facility_association', label: 'Facility Association' },
                        { value: 'gore_mutual', label: 'Gore Mutual' },
                        { value: 'other', label: 'Industrielle Alliance' },
                        { value: 'intact_assurance_autre', label: 'Intact' },
                        { value: 'la_personnelle_autre', label: 'La Personnelle' },
                        { value: 'lunique_autre', label: "L'Unique Assurance" },
                        { value: 'lloyds', label: "Lloyd's" },
                        { value: 'missisquoi', label: 'Missisquoi' },
                        { value: 'northbridge', label: 'Northbridge Assurance' },
                        { value: 'optimum', label: 'Optimum' },
                        { value: 'pafco', label: 'Pafco' },
                        { value: 'peel_mutual', label: 'Peel Mutual' },
                        { value: 'pembridge', label: 'Pembridge' },
                        { value: 'portage_mutual', label: 'Portage Mutual' },
                        { value: 'assurance_promutuel_autre', label: 'Promutuel' },
                        { value: 'sonnet_autre', label: 'Sonnet' },
                        { value: 'assurance_td_autre', label: 'TD' },
                        { value: 'travelers_canada', label: 'Travelers' },
                        { value: 'unica', label: 'Unica' },
                        { value: 'wawanesa_autre', label: 'Wawanesa' },
                        { value: 'autre', label: 'Autre' },
                    ],
                },
            ],
        },
        {
            name: 'coverageExpiryMonth',
            type: 'dropdown',
            label: 'À quel mois votre couverture expire-t-elle avec {currentInsurer}?',
            labelDynamicField: 'currentInsurer',
            labelWhenOther: 'À quel mois votre couverture expire-t-elle?',
            placeholder: 'Sélectionner...',
            required: true,
            showWhen: {
                field: 'currentInsurer',
                value: 'any',
            },
            defaultValue: 'je_ne_sais_pas',
            options: [
                { value: 'je_ne_sais_pas', label: 'Je ne sais pas' },
                { value: 'janvier', label: 'Janvier' },
                { value: 'fevrier', label: 'Février' },
                { value: 'mars', label: 'Mars' },
                { value: 'avril', label: 'Avril' },
                { value: 'mai', label: 'Mai' },
                { value: 'juin', label: 'Juin' },
                { value: 'juillet', label: 'Juillet' },
                { value: 'aout', label: 'Août' },
                { value: 'septembre', label: 'Septembre' },
                { value: 'octobre', label: 'Octobre' },
                { value: 'novembre', label: 'Novembre' },
                { value: 'decembre', label: 'Décembre' },
            ],
        },
    ],
};

export const driver3bScreen = {
    id: '3b-driver1',
    type: 'regular',
    stepId: 2,
    title: 'Rejoignez les milliers qui ont trouvé l\'assurance parfaite',
    subtitle: '',
    driverIcon: true,
    nextScreen: '4-driver1',
    fields: [
        {
            name: 'licenseType',
            type: 'dropdown',
            label: 'Quel type de permis détenez-vous actuellement ?',
            placeholder: 'Sélectionner...',
            required: true,
            defaultValue: 'G',
            options: [
                { value: 'G', label: 'Permis régulier' },
                { value: 'G2', label: 'Permis probatoire' },
                { value: 'G1', label: 'Permis temporaire (apprenti)' },
            ],
        },
        {
            name: 'licenseAge',
            type: 'dropdown',
            label: 'À quel âge avez-vous obtenu votre permis de conduire au Québec?',
            placeholder: 'Sélectionner...',
            required: true,
            options: [
                { value: '16', label: '16 ans' },
                { value: '17', label: '17 ans' },
                { value: '18', label: '18 ans' },
                { value: '19', label: '19 ans' },
                { value: '20', label: '20 ans' },
                { value: '21', label: '21 ans' },
                { value: 'autre', label: 'Autre' },
            ],
        },
        {
            name: 'licenseAgeOther',
            type: 'text',
            label: 'Veuillez préciser l\'âge.',
            placeholder: 'Entrez l\'âge',
            required: true,
            numbersOnly: true,
            min: 16,
            max: 120,
            showWhen: {
                field: 'licenseAge',
                value: 'autre'
            }
        },
    ],
};

export const driver4Screen = {
    id: '4-driver1',
    type: 'regular',
    stepId: 2,
    title: 'Antécédents de conduite et d\'assurance',
    subtitle: '',
    driverIcon: true,
    nextScreen: '9-driver1',
    showNoToAllButton: true,
     conditionalNavigation: [
        /* { field: 'cancelledOrRefused', value: 'oui', nextScreen: '5-driver1' },*/
        { field: 'licenseSuspension', value: 'oui', nextScreen: '6-driver1' },
        { field: 'atFaultAccidents', value: 'oui', nextScreen: '7-driver1' },
        /* { field: 'trafficViolations', value: 'oui', nextScreen: '8-driver1' }
        ,*/
    ],
    fields: [
        {
            name: 'cancelledOrRefused',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Au cours des 3 dernières années, avez-vous déjà été annulé ou refusé par un assureur?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'licenseSuspension',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Au cours des 5 dernières années, avez-vous eu des suspensions ou des révocations de permis?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'atFaultAccidents',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Au cours des 6 dernières années, avez-vous eu des réclamations ou des sinistres?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'trafficViolations',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Au cours des 3 dernières années, avez-vous perdu des points d’inaptitude?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'criminalRecord',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Avez-vous un dossier criminel non libéré, ou vivez-vous avec une personne qui en a un?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'bankruptcy',
            type: 'buttonGroup',
            variant: 'switch',
            label: 'Au cours des 5 dernières années, avez-vous fait faillite ou une proposition de consommateur?',
            required: true,
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
    ],
};

// Screen 5: Insurance Cancellations
export const driver5Screen = {
    id: '5-driver1',
    type: 'dynamicList',
    stepId: 2,
    title: 'Antécédents de conduite et d\'assurance',
    subtitle: '',
    cardTitle: 'Annulation d\'assurance',
    cardSubtitle: 'Si vous n\'êtes plus certain de vos annulations, cliquez sur « X » et poursuivez.',
    driverIcon: true,
    nextScreen: '9-driver1', // Default: skip to summary
    conditionalNextScreen: {
        checkScreenId: '4-driver1',
        conditions: [
            { field: 'licenseSuspension', value: 'oui', nextScreen: '6-driver1' },
            { field: 'atFaultAccidents', value: 'oui', nextScreen: '7-driver1' },
            { field: 'trafficViolations', value: 'oui', nextScreen: '8-driver1' },
        ],
    },
    dynamicListConfig: {
        itemLabel: 'Annulation',
        addButtonText: 'Ajouter une annulation +',
        maxItems: 4,
        startEmpty: false,
    },
    fields: [
        {
            name: 'cancellationReason',
            type: 'dropdown',
            label: 'Pour quel raison votre assurance a-t-elle été annulée?',
            required: true,
            options: [
                { value: 'non_paiement', label: 'Non-paiement' },
                { value: 'fausse_declaration', label: 'Fausse déclaration' },
                { value: 'trop_sinistres', label: 'Trop de sinistres' },
                { value: 'autre', label: 'Autre' },
            ],
        },
        {
            name: 'cancellationDates',
            type: 'dateRange',
            label: 'Veuillez sélectionner la date de début  et de fin de l’annulation de l’assurance.',
            description: 'Vous pouvez mettre une date approximative et confirmer par la suite avec le courtier',
            startLabel: 'Début',
            endLabel: 'Fin',
            placeholder: 'MM/AAAA',
            pickerMode: 'month',
            required: true,
            validation: {
                type: 'past',
                message: 'La date d\'annulation ne peut pas être dans le futur'
            },
        },
    ],
};

// Screen 6: License Suspensions
export const driver6Screen = {
    id: '6-driver1',
    type: 'dynamicList',
    stepId: 2,
    title: 'Antécédents de conduite et d\'assurance',
    subtitle: '',
    cardTitle: 'Suspension(s) de permis',
    cardSubtitle: 'Si vous n\'êtes plus certain de vos suspensions, cliquez sur « X » et poursuivez.',
    driverIcon: true,
    nextScreen: '9-driver1', // Default: skip to summary
    conditionalNextScreen: {
        checkScreenId: '4-driver1',
        conditions: [
            { field: 'atFaultAccidents', value: 'oui', nextScreen: '7-driver1' },
            // { field: 'trafficViolations', value: 'oui', nextScreen: '8-driver1' },
        ],
    },
    dynamicListConfig: {
        itemLabel: 'Suspension',
        addButtonText: 'Ajouter une suspension +',
        maxItems: 4,
        startEmpty: false,
    },
    fields: [
        {
            name: 'suspensionReason',
            type: 'dropdown',
            label: 'Pour quel raison votre permis a-t-il été suspendu?',
            required: true,
            options: [
                { value: 'alcool', label: 'Suspension de permis liée à l\'alcool' },
                { value: 'points_inaptitude', label: 'Accumulation de points d\'inaptitude (trop d\'infractions)' },
                { value: 'autre', label: 'Autre' },
            ],
        },
        {
            name: 'suspensionDates',
            type: 'dateRange',
            label: 'Veuillez sélectionner la date de début  et de fin de suspension de permis.',
            description: 'Vous pouvez mettre une date approximative et confirmer par la suite avec le courtier',
            startLabel: 'Début',
            endLabel: 'Fin',
            placeholder: 'MM/AAAA',
            pickerMode: 'month',
            required: true,
            validation: {
                type: 'past',
                message: 'La date de suspension ne peut pas être dans le futur'
            },
        },
    ],
};

// Screen 7: Claims/Accidents
export const driver7Screen = {
    id: '7-driver1',
    type: 'dynamicList',
    stepId: 2,
    title: 'Antécédents de conduite et d\'assurance',
    subtitle: '',
    cardTitle: 'Réclamation(s) et/ou sinitre(s)',
    cardSubtitle: 'Si vous n\'êtes plus certain de vos réclamations et/ou sinitres, cliquez sur « X » et poursuivez.',
    driverIcon: true,
    nextScreen: '9-driver1', // Default: skip to summary
    // conditionalNextScreen: {
    //     checkScreenId: '4-driver1',
    //     conditions: [
    //         { field: 'trafficViolations', value: 'oui', nextScreen: '8-driver1' },
    //     ],
    // },
    dynamicListConfig: {
        itemLabel: 'Réclamation ou sinitre',
        addButtonText: 'Ajouter un événement +',
        maxItems: 4,
        startEmpty: false,
    },
    fields: [
        {
            name: 'claimType',
            type: 'dropdown',
            label: 'Quel type de réclamation ou sinitre?',
            required: true,
            options: [
                
                {value: 'collision' , label: 'Accident responsable'},
                {value: 'liability' , label: 'Accident non responsable'},
                {value: 'glass_breakage' , label: 'Pare-brise remplacé ou vitre brisée'},
                {value: 'glass_repair' , label: 'Pare-brise réparé (petit impact, pas remplacé)'},
                {value: 'theft' , label: 'Vol'},
                {value: 'vandalism' , label: 'Vandalisme'},
                {value: 'fire' , label: 'Feu'},
                {value: 'hail' , label: 'Grêle (dommages météo)'}
            ],
        },
        {
            name: 'claimDate',
            type: 'date',
            label: 'Date de l\'événement',
            description: 'Vous pouvez mettre une date approximative et confirmer par la suite avec le courtier',
            placeholder: 'MM/AAAA',
            pickerMode: 'month',
            required: true,
            validation: {
                type: 'past',
                message: 'La date de l\'événement ne peut pas être dans le futur'
            },
        },
    ],
};

// Screen 8: Traffic Violations
export const driver8Screen = {
    id: '8-driver1',
    type: 'dynamicList',
    stepId: 2,
    title: 'Antécédents de conduite et d\'assurance',
    subtitle: '',
    cardTitle: 'Contravention(s) routière(s)',
    cardSubtitle: 'Si vous n’êtes plus certain de vos contraventions ayant entraîné une perte de points d’inaptitude, cliquez sur « X » et poursuivez.',
    driverIcon: true,
    nextScreen: '9-driver1',
    dynamicListConfig: {
        itemLabel: 'Contravention',
        addButtonText: 'Ajouter une contravention +',
        maxItems: 4,
        startEmpty: false,
    },
    fields: [
        {
            name: 'violationType',
            type: 'dropdown',
            label: 'Quel est le motif de la contravention?',
            required: true,
            options: [
                { value: 'exces_vitesse', label: 'Excès de vitesse' },
                { value: 'feu_rouge', label: 'Feu rouge' },
                { value: 'stop', label: 'Arrêt obligatoire' },
                { value: 'cellulaire', label: 'Cellulaire au volant' },
                { value: 'autre', label: 'Autre' },
            ],
        },
        {
            name: 'violationDate',
            type: 'date',
            label: 'Date de la contravention',
            description: 'Vous pouvez mettre une date approximative et confirmer par la suite avec le courtier',
            placeholder: 'MM/AAAA',
            pickerMode: 'month',
            required: true,
            validation: {
                type: 'past',
                message: 'La date de la contravention ne peut pas être dans le futur'
            },
        },
    ],
};

export const driverSummaryScreen = {
    id: '9-driver1',
    type: 'summary',
    stepId: 2,
    title: 'Ajoutez un second conducteur',
    subtitle: '',
    summaryType: 'driver',
    nextScreen: 'contact-info',
};

export const driverScreens = {
    '1-driver1': driver1Screen,
    '2-driver1': driver2Screen,
    '3-driver1': driver3Screen,
    '3b-driver1': driver3bScreen,
    '4-driver1': driver4Screen,
    '5-driver1': driver5Screen,
    '6-driver1': driver6Screen,
    '7-driver1': driver7Screen,
    '8-driver1': driver8Screen,
    '9-driver1': driverSummaryScreen,
};

