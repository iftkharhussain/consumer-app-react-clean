/* eslint-disable */
export const auto1Screen = {
    id: 'auto-1',
    type: 'regular',
    stepId: 1,
    title: 'Débute avec Norga',
    subtitle: 'Parlez-nous de votre véhicule.',
    vehicleIcon: true,
    vehicleLabel: 'Véhicule 1',
    nextScreen: '2-auto1',
    alternativeLink: {
        text: 'Trouver l\'auto avec le NIV',
        targetScreen: '1.1-auto1',
    },
    fields: [
        {
            name: 'year',
            type: 'dropdown',
            label: 'Année',
            isDynamic: true,
            showSearch: true,
            options: [
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
                { value: '2022', label: '2022' },
                { value: '2021', label: '2021' },
                { value: '2020', label: '2020' },
                { value: '2019', label: '2019' },
                { value: '2018', label: '2018' },
                { value: '2017', label: '2017' },
                { value: '2016', label: '2016' },
                { value: '2015', label: '2015' },
            ],
        },
        {
            name: 'manufacturer',
            type: 'dropdown',
            label: 'Fabricant',
            isDynamic: true,
            showSearch: true,
        },
        {
            name: 'model',
            type: 'dropdown',
            label: 'Modèle',
            isDynamic: true,
            showSearch: true,
            helpIcon: true,
            helpInfo: {
                image: '/images/modal.svg',
                text: 'Le modèle du véhicule se trouve généralement à l’arrière de la voiture, sur votre carte d’assurance ou sur vos documents d’immatriculation (papier vert).'
            },
            options: [
                { value: 'autre', label: 'Autre' },
            ],
        },
    ],
};

export const vinLookupScreen = {
    id: '1.1-auto1',
    type: 'regular',
    stepId: 1,
    title: 'Débute avec Norga',
    subtitle: 'Parlez-nous de votre véhicule.',
    vehicleIcon: true,
    vehicleLabel: 'Véhicule 1',
    nextScreen: '2-auto1',
    fields: [
        {
            name: 'vin',
            type: 'text',
            label: 'Numéro de série ou NIV',
            placeholder: '0AAAA00AAAA000000',
            maxLength: 17,
            helpIcon: true,
            helpInfo: {
                image: '/images/vin.svg',
                text: 'Vous pouvez trouver le NIV sur le tableau de bord (visible à travers le pare-brise), votre certificat d’immatriculation, vos documents d’achat, votre carte d’assurance ou à l’intérieur de la portière côté conducteur.',
                imageStyle: { width: '229px', height: '168px' }
            },
        },
    ],
};

export const vehicleDetailsScreen = {
    id: '2-auto1',
    type: 'regular',
    stepId: 1,
    title: 'Parlez-nous de votre véhicule.',
    subtitle: '',
    vehicleIcon: true,
    vehicleLabel: 'Mazda Cx-9, 2020',
    nextScreen: '3-auto1',
    fields: [
        {
            name: 'ownership',
            type: 'buttonGroup',
            label: 'Le véhicule est-il financé, loué ou payé?',
            options: [
                { value: 'finance', label: 'Financé' },
                { value: 'loue', label: 'Loué' },
                { value: 'paye', label: 'Payé' },
            ],
        },
        {
            name: 'vehicleConditionAtPurchase',
            type: 'buttonGroup',
            label: 'Quel était l\'état de la voiture lors de l\'achat?',
            options: [
                { value: 'nouveau', label: 'Nouveau' },
                { value: 'usage', label: 'Usagé' },
                { value: 'demo', label: 'Démo' },
            ],
        },
        {
            name: 'purchaseDate',
            type: 'date',
            label: 'Quand avez-vous acheté ou loué le véhicule?',
            placeholder: 'YYYY-MM',
            picker: 'month',
            hidden: true,
            required: false,
            validation: {
                type: 'past',
                message: 'La date d\'achat ne peut pas être dans le futur'
            },
        },
        {
            name: 'parkingLocation',
            type: 'dropdown',
            label: 'À quel endroit le véhicule est-il habituellement stationné la nuit?',
            hidden: true,
            required: false,
            options: [
                { value: 'carport', label: 'Abri d\'auto' },
                { value: 'lot', label: 'Parc de stationnement' },
                { value: 'driveway', label: 'Entrée privée' },
                { value: 'garage', label: 'Garage privé' },
                { value: 'secure', label: 'Copropriétaire/App. garage sécurisé' },
                { value: 'storage', label: 'Entreposage' },
                { value: 'street', label: 'Rue' },
                { value: 'underground', label: 'Stationnement souterrain' },
                { value: 'unsecure', label: 'Copropriétaire/App. garage ou lot non sécurisé' },
                { value: 'other', label: 'Autre' },
            ],
        },
        {
            name: 'antiTheft',
            type: 'imageSelect',
            label: 'Avez-vous l’un de ces dispositifs antivol sur votre véhicule?',
            defaultValue: 'none',
            options: [
                { value: 'none', label: 'Aucun', image: '/images/circle-cross-gray.png', selectedImage: '/images/circle-cross-blue.png', imageStyle: { width: '36px', height: '36px', marginTop: '9px' } },
                { value: 'vinlock', label: 'Vin-Lock', image: '/images/vinlock.png', imageStyle: { width: '76.572px', height: '52.507px', aspectRatio: '76.57 / 52.51', marginTop: '15px' } },
                { value: 'tag', label: 'Tag', image: '/images/tag.png', imageStyle: { width: '68.631px', height: '45.754px', aspectRatio: '68.63 / 45.75', marginTop: '13px' } },
                { value: 'sherlock', label: 'Sherlock', image: '/images/sherlock.png', imageStyle: { width: '55.925px', height: '49.534px', aspectRatio: '55.93 / 49.53', marginTop: '12px' } },
                { value: 'domino', label: 'Domino', image: '/images/domino.png', imageStyle: { width: '61.544px', height: '37.873px', aspectRatio: '61.54 / 37.87', marginTop: '13px' } },
            ],
        },
    ],
};

export const vehicleUsageScreen = {
    id: '3-auto1',
    type: 'regular',
    stepId: 1,
    title: 'Parlez-nous de votre véhicule.',
    subtitle: '',
    vehicleIcon: true,
    vehicleLabel: 'Mazda Cx-9, 2020',
    nextScreen: '4-auto1',
    fields: [
        {
            name: 'primaryUsage',
            type: 'imageSelect',
            label: 'Quel est l\'usage principal de ce véhicule?',
            required: true,
            defaultValue: 'ecole_travail',
            boxStyle: { width: '113.067px', height: '138.423px', borderRadius: '8px', border: '1.5px solid #ededed', background: '#FFF', boxShadow: 'none' },
            labelStyle: { fontSize: '10px', fontWeight: 600, lineHeight: '12px' },
            options: [
                { value: 'ecole_travail', label: 'Aller à l\'école/travail', image: '/images/var-1.svg', imageStyle: { width: '94px', height: '55px' } },
                { value: 'affaires', label: 'Affaires', image: '/images/var-2.png', imageStyle: { width: '100px', height: '68px' } },
                { value: 'plaisir', label: 'Plaisir seulement', image: '/images/var-3.svg', imageStyle: { width: '101px', height: '59px' } },
                { value: 'taxi_livraison', label: 'Taxi/livraison', image: '/images/var-4.png', imageStyle: { width: '80px', height: '65px' } },
            ],
        },
        {
            name: 'annualKm',
            type: 'dropdown',
            label: 'En moyenne, combien de kilomètres parcourez-vous par année avec ce véhicule?',
            placeholder: 'Sélectionner...',
            options: [
                { value: '0-1000', label: '0 à 1 000 km par année' },
                { value: '1001-2000', label: '1 001 à 2 000 km par année' },
                { value: '2001-3000', label: '2 001 à 3 000 km par année' },
                { value: '3001-4000', label: '3 001 à 4 000 km par année' },
                { value: '4001-5000', label: '4 001 à 5 000 km par année' },
                { value: '5001-6000', label: '5 001 à 6 000 km par année' },
                { value: '6001-7000', label: '6 001 à 7 000 km par année' },
                { value: '7001-8000', label: '7 001 à 8 000 km par année' },
                { value: '8001-9000', label: '8 001 à 9 000 km par année' },
                { value: '9001-10000', label: '9 001 à 10 000 km par année' },
                { value: '10001-11000', label: '10 001 à 11 000 km par année' },
                { value: '11001-12000', label: '11 001 à 12 000 km par année' },
                { value: '12001-13000', label: '12 001 à 13 000 km par année' },
                { value: '13001-14000', label: '13 001 à 14 000 km par année' },
                { value: '14001-15000', label: '14 001 à 15 000 km par année' },
                { value: '15001-16000', label: '15 001 à 16 000 km par année' },
                { value: '16001-17000', label: '16 001 à 17 000 km par année' },
                { value: '17001-18000', label: '17 001 à 18 000 km par année' },
                { value: '18001-19000', label: '18 001 à 19 000 km par année' },
                { value: '19001-20000', label: '19 001 à 20 000 km par année' },
                { value: '20001-25000', label: '20 001 à 25 000 km par année' },
                { value: '25001-30000', label: '25 001 à 30 000 km par année' },
                { value: '30001-40000', label: '30 001 à 40 000 km par année' },
                { value: '40001+', label: '40 001 km ou plus par année' },
            ],
        },
        {
            name: 'dailyCommuteKm',
            type: 'inputWithSuffix',
            label: 'Combien de kilomètres parcourez-vous pour aller au travail ou à l\'école chaque jour? (aller simple) ',
            placeholder: 'ex: 10',
            numbersOnly: true,
            suffix: 'km/jour',
            min: 0,
            max: 500,
            maxLength: 3,
        },
    ],
};

export const vehicleConditionScreen = {
    id: '4-auto1',
    type: 'regular',
    stepId: 1,
    title: 'Parlez-nous de votre véhicule.',
    subtitle: '',
    vehicleIcon: true,
    vehicleLabel: 'Mazda Cx-9, 2020',
    nextScreen: '5-auto1',
    fields: [
        {
            name: 'usedOutsideQuebec',
            type: 'buttonGroup',
            label: 'Votre véhicule est-il utilisé à l’extérieur du Québec plus de 30 jours par année?',
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'weeksOutsideQuebec',
            type: 'dropdown',
            label: 'En moyenne, combien de semaines par année votre véhicule est-il utilisé à l’extérieur du Québec?',
            placeholder: 'Sélectionner...',
            showWhen: {
                field: 'usedOutsideQuebec',
                value: 'oui',
            },
            options: [
                { value: '4-7', label: '4 à 7 semaines' },
                { value: '8-15', label: '8 à 15 semaines' },
                { value: '16-26', label: '16 à 26 semaines' },
                { value: '26+', label: 'Plus de 26 semaines ou plus de 6 mois' },
            ],
        },
        {
            name: 'isModified',
            type: 'buttonGroup',
            label: 'Le véhicule est-il modifié, reconstruit ou endommagé présentement?',
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'modificationTypes',
            type: 'checkboxSelect',
            label: 'Sélectionnez toutes les options qui s\'appliquent au véhicule',
            showWhen: {
                field: 'isModified',
                value: 'oui',
            },
            options: [
                { value: 'modifie', label: 'Modifié' },
                { value: 'reconstruit', label: 'Reconstruit' },
                { value: 'endommage', label: 'Endommagé' },
            ],
        },
    ],
};

export const vehicleCoverageScreen = {
    id: '5-auto1',
    type: 'regular',
    stepId: 1,
    title: 'Parlez-nous de votre véhicule.',
    subtitle: '',
    vehicleIcon: true,
    headerText: {
        text: 'Quelles protections aimeriez-vous avoir pour ce véhicule?',
        subText: 'Vous pourrez modifier votre sélection avec un courtier après avoir reçu vos soumissions.'
    },
    vehicleLabel: 'Mazda Cx-9, 2020',
    nextScreen: 'summary-1car',
    fields: [
        {
            name: 'coverageType',
            type: 'buttonGroup',
            label: '',
            required: true,
            variant: 'coverage-selection',
            columns: 2,
            options: [
                { value: 'one_side', label: 'Protections 1 côté' },
                { value: 'two_sides', label: 'Protections 2 côtés' },
                { value: 'base_only', label: 'Responsabilité civile seulement' },
            ],
            coverageDetails: {
                base_only: [
                    {
                        title: 'Responsabilité civile',
                        description: 'Vous serez couvert pour les dommages corporels ou matériels que vous causez à d’autres personnes lors d’un accident d’automobile où vous êtes responsable. Cette protection peut aussi couvrir les frais juridiques si vous êtes poursuivi.',
                        image: '/images/var6.svg'
                    }
                ],
                one_side: [
                  
                    {
                        title: 'Accident sans collision ni versement',
                        description: 'Vous serez couvert pour les dommages à votre véhicule en lien avec des situations autres qu’une collision ou un renversement comme par exemple un feu, un vol, un bris de vitre, un vandalisme ou une collision avec un animal.',
                        image: '/images/accident.svg',
                        imageStyle: { width: '95px', height: '60px' }
                    },
                      {
                        title: 'Responsabilité civile',
                        description: 'Vous serez couvert pour les dommages corporels ou matériels que vous causez à d’autres personnes lors d’un accident d’automobile où vous êtes responsable. Cette protection peut aussi couvrir les frais juridiques si vous êtes poursuivi.',
                        image: '/images/var6.svg'
                    },
                ],
                two_sides: [
                 
                    {
                        title: 'Collision ou versement',
                        description: 'Vous serez couvert pour les dommages à votre véhicule causés par : une collision avec un autre véhicule, un impact avec un objet fixe ou un renversement, peu importe qui est responsable.',
                        image: '/images/collision.svg'
                    },
                    {
                        title: 'Accident sans collision ni versement',
                        description: 'Vous serez couvert pour les dommages à votre véhicule en lien avec des situations autres qu’une collision ou un renversement comme par exemple un feu, un vol, un bris de vitre, un vandalisme ou une collision avec un animal.',
                        image: '/images/accident.svg'
                    },
                       {
                        title: 'Responsabilité civile',
                        description: 'Vous serez couvert pour les dommages corporels ou matériels que vous causez à d’autres personnes lors d’un accident d’automobile où vous êtes responsable. Cette protection peut aussi couvrir les frais juridiques si vous êtes poursuivi.',
                        image: '/images/var6.svg'
                    },
                    {
                        title: 'Protections bonifiées',
                        description: 'Ce regroupement inclut des protections supplémentaires qui viennent bonifier votre assurance automobile. Elles offrent une protection plus complète dans plusieurs situations du quotidien, comme lors de l’utilisation d’un véhicule loué ou emprunté, ou lorsque votre véhicule est temporairement inutilisable.',
                        image: '/images/add-sign-car.svg',
                        imageStyle: { width: '95px', height: '70px' }
                    }
                ]
            }
        },
    ],
};

// Export all vehicle screens
export const vehicleScreens = {
    'auto-1': auto1Screen,
    '1.1-auto1': vinLookupScreen,
    '2-auto1': vehicleDetailsScreen,
    '3-auto1': vehicleUsageScreen,
    '4-auto1': vehicleConditionScreen,
    '5-auto1': vehicleCoverageScreen,
};
