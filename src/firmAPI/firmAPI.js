import fetch from "node-fetch"

async function getData() {
  // Get the date of the day
  let date = new Date()
  const today = date.toISOString().split("T")[0]
  const url =
    "https://firms.modaps.eosdis.nasa.gov/api/country/csv/01dbe567da924b7f4f01780a6615ef11/VIIRS_SNPP_NRT/ARG/1/" +
    today

  let today_data
  await fetch(url)
    .then((res) => res.text())
    .then((text) => {
      today_data = text.split("\n")
    })
    .catch((err) => console.log(err))

  // Turn the fetch data to an array
  let today_data_arr = []
  today_data.map((each_row) => {
    const parsed_row = each_row.split(",")
    today_data_arr.push(parsed_row)
  })

  console.log(today_data_arr)

  return today_data_arr
}

async function checkIfInRosario(lat, lon) {
  const url =
    "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
    lat +
    "&lon=" +
    lon +
    "&zoom=18&addressdetails=1"
  let place_name
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data.address)
      const address = data.address
      if (address.hasOwnProperty("state")) {
        if (address.state == "Santa Fe") {
          if (address.hasOwnProperty("city")) {
            if (address.city == "Rosario") {
              place_name = data.display_name
            }
          }
        }
      }
    })

  if (place_name) {
    return [true, place_name]
  } else {
    return [false, "the place is not in Rosario"]
  }
}

async function createDatasetToday() {
  const today_data = getData()
}
// const check = await checkIfInRosario("-32.991423", "-60.712546")
// console.log(check)

getData()
