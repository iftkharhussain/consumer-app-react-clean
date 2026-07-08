/* eslint-disable */
export const discountScreen = {
    id: 'discount',
    type: 'regular',
    stepId: 3,
    title: 'Rabais',
    subtitle: '',
    nextScreen: 'contact-info',
    headerText: {
        text: 'Obtenez un **rabais de 10 à 15 %** en regroupant plusieurs assurances (ex. : habitation, condo, locataire) avec la même compagnie.',
    },
    fields: [
        {
            name: 'bundleInsurance',
            type: 'buttonGroup',
            label: 'Souhaitez-vous regrouper vos assurances ?',
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
        {
            name: 'maConduite',
            type: 'buttonGroup',
            label: 'Seriez-vous prêt à participer au programme Ma conduite?',
            options: [
                { value: 'oui', label: 'Oui' },
                { value: 'non', label: 'Non' },
            ],
        },
    ],
};

export const contactInfoScreen = {
    id: 'contact-info',
    type: 'contact',
    stepId: 3,
    title: 'Félicitations, il reste une seule étape!',
    subtitle: 'Pour qui devons-nous générer les soumissions?',
    isContactInfo: true,
    nextScreen: 'verification',
    fields: [
        {
            name: 'fullName',
            type: 'text',
            placeholder: 'Martin Matt',
            noLabel: true,
        },
        {
            name: 'phone',
            type: 'phone',
            placeholder: 'Numéro de téléphone',
            noLabel: true,
            prefix: '+1',
            required: true,
        },
        {
            name: 'email',
            type: 'text',
            placeholder: 'Courriel',
            noLabel: true,
        },
    ],
};

export const verificationScreen = {
    id: 'verification',
    type: 'verification',
    stepId: 3,
    title: 'Dernière étape!',
    subtitle: 'Nous devons vérifier que vous n\'êtes pas un robot',
};

// Export all submission screens
export const submissionScreens = {
    'contact-info': contactInfoScreen,
    'verification': verificationScreen,
};
