const logMarker = (type: string, vehicleNumber: number, vehicleTimestamp: number, routeName: string) => {
  var movementInfo = "";
  switch (type) {
    case "add":
      movementInfo = "Added new marker of vehicle: ";
      break;
    case "move":
      movementInfo = "Moved marker of vehicle: ";
      break;
    default:
      break;
  }

  const actualDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(Date.now());

  const realDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(vehicleTimestamp * 1000);

  console.log(
    movementInfo +
      vehicleNumber +
      " on route: " +
      routeName +
      ". Real timestamp: " +
      realDate +
      ". Added at timestamp: " +
      actualDate
  );
};

export default logMarker;
