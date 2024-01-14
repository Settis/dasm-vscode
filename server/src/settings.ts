export type Settings = {
    labels: LabelsSettings
}

export type LabelsSettings = {
    localPrefix: string[] | null | undefined
}

export const DEFAULT_SETTINGS: Settings = {
    labels: {
        localPrefix: []
    }
};
