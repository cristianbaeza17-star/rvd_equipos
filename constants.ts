
export const difficultyConfig = {
    1: { // Principiante
        ballSpeed: { min: 2, max: 3 },
        hideTime: { min: 120, max: 180 },
        hidePoint: 0.5,
        trajectoryTypes: ['horizontal'],
        ballRadius: 15,
        targetZoneWidth: 60
    },
    2: { // Básico
        ballSpeed: { min: 2.5, max: 4 },
        hideTime: { min: 100, max: 150 },
        hidePoint: 0.45,
        trajectoryTypes: ['horizontal', 'diagonal_up', 'diagonal_down'],
        ballRadius: 13,
        targetZoneWidth: 50
    },
    3: { // Intermedio
        ballSpeed: { min: 3, max: 5 },
        hideTime: { min: 80, max: 120 },
        hidePoint: 0.4,
        trajectoryTypes: ['horizontal', 'diagonal_up', 'diagonal_down'],
        ballRadius: 12,
        targetZoneWidth: 40
    },
    4: { // Avanzado
        ballSpeed: { min: 4, max: 6.5 },
        hideTime: { min: 60, max: 100 },
        hidePoint: 0.35,
        trajectoryTypes: ['horizontal', 'diagonal_up', 'diagonal_down', 'curved_up', 'curved_down'],
        ballRadius: 10,
        targetZoneWidth: 35
    },
    5: { // Élite
        ballSpeed: { min: 5, max: 8 },
        hideTime: { min: 40, max: 80 },
        hidePoint: 0.3,
        trajectoryTypes: ['curved_up', 'curved_down', 'diagonal_up', 'diagonal_down'],
        ballRadius: 8,
        targetZoneWidth: 30
    }
};

export const LEVEL_NAMES: { [key: number]: string } = {
    1: 'Principiante 🟢',
    2: 'Básico 🔵',
    3: 'Intermedio 🟡',
    4: 'Avanzado 🟠',
    5: 'Élite 🔴'
};
