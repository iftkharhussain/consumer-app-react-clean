/* eslint-disable */
export const steps = [
    { id: 1, name: 'Véhicule', label: 'Véhicule' },
    { id: 2, name: 'Conducteur', label: 'Conducteur' },
    { id: 3, name: 'Soumission', label: 'Soumission' },
];

export const getStepById = (id) => {
    return steps.find((step) => step.id === id);
};

export const getStepByName = (name) => {
    return steps.find((step) => step.name === name);
};
