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

  return today_data_arr.slice(1)
}

function checkIfInRosario(lat, lon, regions) {
  regions.forEach((region) => {
    const xRange = (region.topLeft[1], region.botRight[1])
    const yRange = (region.topLeft[0], region.botRight[0])
    if (yRange[0] <= lat <= yRange[1] && xRange[0] <= lon <= xRange[1]) {
      return true
    }
  })
  return false
}

async function createDatasetToday() {
  const regions = [{ topLeft: (-1, -2), botRight: (-3, 4) }]
  const today_data = await getData()
  let dataset = []
  today_data.forEach((ele) => {
    const lat = ele[1]
    const lon = ele[2]
    const inRosario = checkIfInRosario(lat, lon, regions)
    if (inRosario) {
      dataset.push(ele)
    }
  })
  return dataset
}
// console.log(check)

// getData()

// createDatasetToday()
