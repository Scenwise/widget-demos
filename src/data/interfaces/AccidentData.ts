// Accident data model, as extracted from the Brabant accidents file
export type AccidentData = {
    ID: number;
    Startdatum: string; // start date
    Einddatum: string; // end date
    Weg: string; // road
    Zijde: string; // road side
    'Hmp van': number; // start hectometer
    'Hmp tot': number; // end hectometer
    Proces: string; // reason of the accident
    Beschrijving: string; // description
    Melder: string; // reporter
};