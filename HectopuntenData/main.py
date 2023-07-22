# This is a sample Python script.
import math

import requests
import pandas as pd
# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
def read_excell_file(path):
    set_roads = set()
    df = pd.read_excel(path)
    shape = df.shape[0]
    # print(df.columns)
    columns = df[["Incidentregistratie", "Unnamed: 2", "Unnamed: 3", "Unnamed: 5", "Unnamed: 6", "Unnamed: 7", "Unnamed: 8", "Unnamed: 12", "Unnamed: 13", "Unnamed: 14", "Unnamed: 24", "Unnamed: 25", "OVD"]]
    return columns


def send_request(set_roads):
    # Use a breakpoint in the code line below to debug your script.

    URL = "https://gateway.scenwise.nl/graph-service/geojson/hectopunten_data"
    # PARAMS = {'address': location}
    r = requests.get(url=URL)
    data = r.json()
    # print(data)
    hectopunten = {}
    for weg_num in set_roads:
        hectopunten[weg_num] = {
            "R": [],
            "L": [],
            "#": []
        }
    for entity in data["features"]:
        geometry = entity["geometry"]["coordinates"]
        properties = entity["properties"]
        rpe_code = properties["rpe_code"]
        wegnr = properties["wegnr_hmp"]
        hecto_lttr = properties["hecto_lttr"]
        hectomtrng = properties["hectomtrng"]/10
        if wegnr in set_roads:
            hectopunten[wegnr][rpe_code].append({
                "wegnr": wegnr,
                "rpe_code": rpe_code,
                "hecto_lttr": hecto_lttr,
                "hectomtrng": hectomtrng,
                "geometry": geometry
            })
    return hectopunten

def assign_location_to_incident(columns, hectopunten):
    for i in range(columns.shape[0]):
        if i == 0:
            continue
        weg_nr = columns.loc[i]["Unnamed: 5"]
        direction = columns.loc[i]["Unnamed: 6"]

        if direction == "Re":
            direction = "R"
        elif direction == "Li":
            direction = "L"
        elif direction == "M":
            direction = "#"
        closest = 100000
        coordinates = [-1, 1]
        hectometer = columns.loc[i]["Unnamed: 7"]

        closest_tot = 100000
        coordinates_tot = [-1, 1]
        hectometer_tot = columns.loc[i]["Unnamed: 8"]

        if type(direction) == float:
            continue

        for point in hectopunten[weg_nr][direction]:
            if abs(point["hectomtrng"]-hectometer) < closest:
                closest = abs(point["hectomtrng"]-hectometer)
                coordinates = point["geometry"]

        if not math.isnan(hectometer_tot):
            for point in hectopunten[weg_nr][direction]:
                if abs(point["hectomtrng"]-hectometer_tot) < closest_tot:
                    closest_tot = abs(point["hectomtrng"]-hectometer_tot)
                    coordinates_tot = point["geometry"]

        columns.at[i, "Longitude_van"] = coordinates[0]
        columns.at[i, "Latitude_van"] = coordinates[1]
        columns.at[i, "Longitude_tot"] = coordinates_tot[0]
        columns.at[i, "Latitude_tot"] = coordinates_tot[1]
    return columns


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    columns = read_excell_file("export-202304171104.xls")
    columns.insert(loc=columns.shape[1], column="Longitude_van", value=1)
    columns.insert(loc=columns.shape[1], column="Latitude_van", value=1)
    columns.insert(loc=columns.shape[1], column="Longitude_tot", value=1)
    columns.insert(loc=columns.shape[1], column="Latitude_tot", value=1)
    set_roads = set()
    for i in range(columns.shape[0]-1):
        if i == 0:
            continue
        set_roads.add(columns.loc[i]["Unnamed: 5"])
        # print()
    hectopunten = send_request(set_roads)
    new_data_frame = assign_location_to_incident(columns, hectopunten)
    new_data_frame.rename(
        columns={
            "Incidentregistratie": "ID",
            "Unnamed: 2": "Starttijd",
            "Unnamed: 3": "Einddatum",
            "Unnamed: 5": "Weg",
            "Unnamed: 6": "Zijde",
            "Unnamed: 7": "Hmp van",
            "Unnamed: 8": "Hmp tot",
            "Unnamed: 12": "Proces",
            "Unnamed: 13": "Beschrijving",
            "Unnamed: 14": "Melder",
            "Unnamed: 24": "Eerste tijd ter plaatse",
            "Unnamed: 25": "Laatste eindtijd",
            "OVD": "OVD"
        }, inplace=True)
    #print(len(new_data_frame.index))
    #new_data_frame.drop(index=[0], inplace=True)
    indices = []
    for i in range(len(new_data_frame.index)):
        if abs(new_data_frame.loc[i]["Longitude_van"]) == 1:
            indices.append(i)
    #print(indices)
    new_data_frame.drop(indices, inplace=True)
    #print(len(new_data_frame.index))
    new_data_frame.to_excel("brabant2022.xlsx")

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
