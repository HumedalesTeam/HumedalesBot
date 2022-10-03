import fetch from "node-fetch"

async function getData() {
  // Get the date of the day for all Argentina
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
  // check if the data point is within the wetland region or not
  regions.forEach((region) => {
    const xRange = (region[1][1], region[0][1])
    const yRange = (region[1][0], region[0][0])
    if (yRange[0] <= lat <= yRange[1] && xRange[0] <= lon <= xRange[1]) {
      return true
    }
  })
  return false
}

async function createDatasetToday() {
  // Filter out only Rosario wetland data from all Argentine fire data
  const regions = [
    [
      [-33.39087482955327, -58.50674748160459],
      [-34.387524974821325, -59.123293544400354],
    ],
    [
      [-33.19934046720891, -59.13810756104891],
      [-33.83221610724139, -60.171178725618375],
    ],
    [
      [-32.612518268000905, -60.2006744136563],
      [-33.0733681732123, -60.64234700361604],
    ],
    [
      [-31.886847558311302, -60.51245376437194],
      [-32.69620288634272, -60.75438881783346],
    ],
  ]
  const today_data = await getData()
  //   console.log("today data is ")
  //   console.log(today_data)
  let dataset = []
  today_data.forEach((ele) => {
    const lat = parseFloat(ele[1])
    const lon = parseFloat(ele[2])
    const inRosario = checkIfInRosario(lat, lon, regions)
    if (inRosario) {
      dataset.push(ele)
    }
  })
  return dataset
}
// console.log(check)

// getData()

const today_dataset = await createDatasetToday()
console.log(today_dataset)
