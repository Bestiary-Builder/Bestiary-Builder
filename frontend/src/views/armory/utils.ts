export const ACTION_TYPE_MAP = {
    0: 'Attack',
    1: 'Action',
    2: 'No Action',
    3: 'Bonus Action',
    4: 'Reaction',
    6: 'Minute',
    7: 'Hour',
    8: 'Special',
    9: 'Legendary',
    10: 'Mythic',
    11: 'Lair',
} as { [key: number]: string }

export const getActionTypeLabel = (value: number) => {
    return ACTION_TYPE_MAP[value] ?? 'Attack'
}