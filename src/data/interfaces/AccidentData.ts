// Accident data model, as extracted from the Brabant accidents file
// Fields that are empty in the excel file are marked as "undefined"

export type AccidentData = {
  ID: number; // id
  Startdatum: Date; // start date, access value with: accidents.current[i].Startdatum.toString()
  Einddatum: Date; // end date
  Weg: string; // road
  Zijde: string; // road side
  "Hmp van": number; // start hectometer, access with: accidents[i]['Hmp van']
  "Hmp tot": number; // end hectometer
  Proces: string; // reason of the accident
  Beschrijving: string; // description
  Melder: string; // reporter
  Latitude: number;
  Longitude: number;
};
