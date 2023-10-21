// Realtime vehicles data model, corresponding to the KV6 structure

export type Vehicle = {
    messageType: string,
    dataOwnerCode: string,
    linePlanningNumber: string,
    operatingDay: Array<number>,
    journeyNumber: number,
    reinforcementNumber: number,
    userStopCode: string,
    passageSequenceNumber: number,
    timestamp: number,
    source: string,
    vehicleNumber: number,
    punctuality: number,
    rdX: number,
    rdY: number,
    longitude: number,
    latitude: number
  };
  