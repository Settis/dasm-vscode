export type Settings = {
    labels: LabelsSettings
}

export type LabelsSettings = {
    hidePrefix: string[] | null | undefined
}

export const DEFAULT_SETTINGS: Settings = {
    labels: {
        hidePrefix: []
    }
};
